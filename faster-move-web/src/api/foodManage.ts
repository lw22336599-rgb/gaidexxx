import request from '/@/utils/request-move.ts'
import type { FoodManageApi } from '/@/views/foodManage/types/api'
import type { FoodMoveConf } from '/@/types/foodMove'
import { ElMessage } from 'element-plus'
import { useUserStore } from '/@/store/modules/user'
import axios from 'axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { version } from '~/package.json'

const baseHeaders = {
  ClientKey: 'u6wzysUGFBjnS4CPtqI1VeRQmdip2B8o6NWajlyZSDExDVVD9gpF/WgAxOK95Kib/7UpKuC5CsTemrzDGMBzLA==',
  WorkId: '678'
}
let host = 'http://localhost:5130'
// const localBaseUrl = localStorage.getItem('customUrl')
// if (localBaseUrl) {
//   var baseUrl = JSON.parse(localBaseUrl)
//   host = baseUrl.food_manage
//   console.log("商品管理地址为:" + host)
// }
let baseUrl = JSON.parse(localStorage.getItem('baseUrl') as string)
console.log(baseUrl)
var urlType = JSON.parse(localStorage.getItem('urlType'))

if (urlType == 'custom') {
  baseUrl = JSON.parse(localStorage.getItem('customUrl') as string)
  console.log('url模式为自定义：', urlType)
}
host = baseUrl.food_manage.replace(/\/$/, '')
console.log('商品管理地址为:' + host)
// 存储所有活动的流式请求
const activeStreams = new Map<string, AbortController>()

/**
 * 中断指定的流式请求
 * @param requestId 请求ID
 */
export const abortStreamRequest = (requestId: string) => {
  const controller = activeStreams.get(requestId)
  if (controller) {
    controller.abort()
    activeStreams.delete(requestId)
    ElMessage.success('已停止任务')
  }
}

/**
 * 检查接口是否支持流式响应
 * @param url 请求地址
 * @param method 请求方法
 * @param params 请求参数
 * @returns Promise<boolean> 是否支持流式响应
 */
const checkStreamSupport = async (url: string, method: string, params: any): Promise<boolean> => {
  try {
    const headers = new Headers()
    Object.entries(baseHeaders).forEach(([key, value]) => {
      headers.append(key, value.toString())
    })
    headers.append('Accept', 'text/event-stream')
    headers.append('client-version', version)

    const response = await fetch(url, {
      method: 'HEAD',
      headers
    })
    const contentType = response.headers.get('content-type')
    return contentType?.includes('text/event-stream') || false
  } catch (error) {
    console.error('检查流式响应支持失败:', error)
    return false
  }
}

/**
 * 处理流式响应
 * @param url 请求地址
 * @param method 请求方法
 * @param params 请求参数
 * @param onProgress 进度回调函数
 * @param requestId 请求ID，用于中断请求
 * @param useQueryParams 是否将参数添加到URL查询字符串中（可选，默认为false）
 */
const handleStreamResponse = async (
  url: string,
  method: string,
  params: any,
  onProgress: (progress: FoodManageApi.ProgressInfo) => void,
  requestId: string,
  useQueryParams: boolean = false
) => {
  try {
    const controller = new AbortController()
    activeStreams.set(requestId, controller)

    // 添加Authorization头部
    const userStore = useUserStore()
    const { token } = userStore

    // 构建请求URL
    const requestUrl = useQueryParams && method === 'post' ? `${url}?${new URLSearchParams(params).toString()}` : url

    // 使用 fetchEventSource 替代 EventSource
    await fetchEventSource(requestUrl, {
      openWhenHidden: true,
      method: method.toUpperCase(),
      headers: {
        ...baseHeaders,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        // 添加连接保持头部
        Connection: 'keep-alive',
        'Keep-Alive': 'timeout=60, max=1000',
        'client-version': version
      },
      body: method === 'post' && !useQueryParams ? JSON.stringify(params) : undefined,
      signal: controller.signal,
      onmessage(event) {
        try {
          const progressData = JSON.parse(event.data) as FoodManageApi.ProgressInfo
          console.log('Received SSE data:', progressData)
          onProgress(progressData)
        } catch (e) {
          console.error('解析进度数据失败:', e, '原始数据:', event.data)
        }
      },
      onerror(error) {
        console.error('SSE错误:', error)
        ElMessage.error('处理响应失败')
        activeStreams.delete(requestId)
        throw error
      },
      async onopen(response) {
        console.log('SSE连接已打开', response.status, response.headers.get('content-type'))
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          return
        }
        // 如果返回的不是流式响应，可能是普通响应，尝试解析
        if (response.ok) {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json') || contentType.includes('text/json')) {
            // 可能是普通JSON响应，先发送一个初始进度
            onProgress({
              Total: 1,
              Progress: 0,
              Item: '正在处理...',
              IsFinished: false,
              ErrMsg: []
            })
            // 读取响应体
            const text = await response.text()
            try {
              const data = JSON.parse(text)
              // 如果返回的是完成状态，发送完成进度
              if (data.code === 200) {
                onProgress({
                  Total: 1,
                  Progress: 1,
                  Item: '处理完成',
                  IsFinished: true,
                  ErrMsg: []
                })
              }
            } catch (e) {
              console.error('解析响应失败:', e)
            }
          }
        }
        throw new Error(`Unexpected response: ${response.status} ${response.statusText}`)
      },
      onclose() {
        console.log('SSE连接已关闭')
        activeStreams.delete(requestId)
      }
    })
  } catch (error) {
    console.error('处理流式响应失败:', error)
    activeStreams.delete(requestId)
    // 如果流式响应失败，可能是后端不支持SSE，回退到普通请求
    // 但先发送一个初始进度，让用户知道正在处理
    onProgress({
      Total: 1,
      Progress: 0,
      Item: '正在处理请求...',
      IsFinished: false,
      ErrMsg: []
    })

    // 使用普通请求
    try {
      const userStore = useUserStore()
      const { token } = userStore
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          ...baseHeaders,
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'client-version': version
        },
        body: method === 'post' && !useQueryParams ? JSON.stringify(params) : undefined
      })

      if (response.ok) {
        const data = await response.json()
        // 发送完成进度
        onProgress({
          Total: 1,
          Progress: 1,
          Item: '处理完成',
          IsFinished: true,
          ErrMsg: []
        })
      } else {
        throw new Error(`请求失败: ${response.status}`)
      }
    } catch (fallbackError) {
      console.error('回退请求也失败:', fallbackError)
      onProgress({
        Total: 1,
        Progress: 1,
        Item: '处理完成',
        IsFinished: true,
        ErrMsg: [`处理失败: ${fallbackError}`]
      })
    }
  }
}

/**
 * 通用请求处理函数
 * @param url 请求地址
 * @param method 请求方法
 * @param params 请求参数
 * @param onProgress 进度回调函数（可选）
 * @param requestId 请求ID，用于中断请求（可选）
 * @param useQueryParams 是否将参数添加到URL查询字符串中（可选，默认为false）
 */
const makeRequest = async <T>(
  url: string,
  method: string,
  params: any,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string,
  useQueryParams: boolean = false
): Promise<T> => {
  if (onProgress && requestId) {
    const isStreamSupported = true //不管了 //await checkStreamSupport(url, method, params)
    if (isStreamSupported) {
      await handleStreamResponse(url, method, params, onProgress, requestId, useQueryParams)
      return {} as T
    } else {
      ElMessage.error('不支持流式响应')
    }
  }
  console.log(useQueryParams, params)
  return request({
    url,
    method,
    data: !useQueryParams && method === 'post' ? params : undefined,
    params: useQueryParams || method === 'get' ? params : undefined,
    headers: baseHeaders
  })
}

// 创建任务
export const createTask = (params: FoodMoveConf) => {
  return request({
    url: `${host}/foodmove/createtask`,
    method: 'post',
    data: params,
    headers: baseHeaders
  })
}

// 测试进度
export const progressTest = (
  params: { taskId: string },
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/ProgressTest`, 'post', params, onProgress, requestId, true)
}

// 从平台拉取商品数据
export const pullShopFoods = (
  params: FoodManageApi.PullShopFoodsParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/pullshopfoods`, 'post', params, onProgress, requestId, true)
}

// 强制从平台重新拉取商品数据
export const pullShopFoodsV2 = (
  params: FoodManageApi.PullShopFoodsV2Params,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/v2/pullshopfoods`, 'post', params, onProgress, requestId)
}

// 获取商品分组
export const getFoodGroups = (taskId: string): Promise<FoodManageApi.RestResult<FoodManageApi.FoodGroupVoItem[]>> => {
  return request({
    url: `${host}/foodmanage/getgroups`,
    method: 'post',
    params: { taskId },
    headers: baseHeaders
  })
}

// 获取商品列表
export const getFoodList = (
  params: FoodManageApi.GetFoodListParams
): Promise<FoodManageApi.RestResult<FoodManageApi.PageResultVo<FoodManageApi.FoodItemVo>>> => {
  return request({
    url: `${host}/foodmanage/queryfoodspage`,
    method: 'post',
    data: params,
    headers: baseHeaders
  })
}

// 批量修改商品价格
export const batchUpdatePrice = (
  params: FoodManageApi.UpdateFoodPriceParms,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefoodprice`, 'post', params, onProgress, requestId)
}

// 批量修改商品图片
export const batchUpdateImage = (params: FoodManageApi.BatchUpdateImageParams) => {
  return request({
    url: `${host}/foodmanage/updatefoodimage`,
    method: 'post',
    data: params,
    headers: baseHeaders
  })
}

// 批量删除商品
export const batchDeleteFood = (
  params: FoodManageApi.BatchDeleteFoodParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/deletefoods`, 'post', params, onProgress, requestId)
}

// 批量上下架商品
export const batchUpdateStatus = (
  params: FoodManageApi.BatchUpdateStatusParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  console.log('foodManage.ts - 发送到后端的状态值:', params.IsOnSale)
  return makeRequest(`${host}/foodmanage/updatefoodstate`, 'post', params, onProgress, requestId)
}

// 批量修改库存
export const batchUpdateStock = (
  params: FoodManageApi.BatchUpdateStockParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefoodstock`, 'post', params, onProgress, requestId)
}

// 批量修改折扣
export const batchUpdateDiscount = (
  params: FoodManageApi.BatchUpdateDiscountParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefooddiscount`, 'post', params, onProgress, requestId)
}

// 批量下线折扣
export const batchOfflineDiscount = (
  params: FoodManageApi.BatchOfflineDiscountParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/offlinediscount`, 'post', params, onProgress, requestId)
}

// 批量修改起购数量
export const batchUpdateMinBuy = (
  params: FoodManageApi.BatchUpdateMinBuyParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefoodminbuy`, 'post', params, onProgress, requestId)
}

// 批量修改商品名称
export const batchUpdateName = (
  params: FoodManageApi.UpdateFoodNameParms,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefoodname`, 'post', params, onProgress, requestId)
}

// 批量更新商品图片边框
export const batchUpdateImageBorder = (
  params: FoodManageApi.BatchUpdateImageBorderParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/updatefoodimageborder`, 'post', params, onProgress, requestId)
}

// 删除第一张主图
export const deleteFirstFoodImage = (
  params: FoodManageApi.DeleteFirstFoodImageParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/deletefirstfoodimage`, 'post', params, onProgress, requestId)
}

// 恢复商品
export const recoverFoods = (
  params: FoodManageApi.RecoverFoodParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/recoverfoods`, 'post', params, onProgress, requestId)
}

// 处理任务
export const disposetask = (taskid: any) => {
  return request({
    url: `${host}/foodmove/disposetask?taskid=${taskid}`,
    method: 'post',
    headers: baseHeaders
  })
}

// 强制从平台拉取活动
export const pullShopAct = (
  params: FoodManageApi.BaseParams,
  onProgress?: (progress: FoodManageApi.ProgressInfo) => void,
  requestId?: string
) => {
  return makeRequest(`${host}/foodmanage/pullshopact`, 'post', params, onProgress, requestId)
}
