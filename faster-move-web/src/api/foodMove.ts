import { ShopType } from '../types/shop'
import request from '/@/utils/request-move.ts'
import brotli from 'brotli'
const headers = {
  ClientKey: 'u6wzysUGFBjnS4CPtqI1VeRQmdip2B8o6NWajlyZSDExDVVD9gpF/WgAxOK95Kib/7UpKuC5CsTemrzDGMBzLA==',
  WorkId: 678
}

// 1-创建任务
export function createTask(data: any) {
  return request({
    url: `/foodmove/createtask`,
    method: 'post',
    data,
    headers
  })
}

export function startTask(data: any) {
  const { taskid, tasktype } = data
  return request({
    url: `/foodmove/starttask?taskid=${taskid}&tasktype=${tasktype}`,
    method: 'post',
    headers
  })
}
//停止任务
export function stopTask(data: any) {
  const { taskid, tasktype } = data
  return request({
    url: `/foodmove/StopTask?taskid=${taskid}&tasktype=${tasktype}`,
    method: 'post',
    headers
  })
}

export function taskProgress(data: any) {
  const { taskid, tasktype } = data
  return request({
    url: `/foodmove/taskprogress?taskid=${taskid}&tasktype=${tasktype}`,
    method: 'post',
    headers
  })
}

// 1-创建任务
export function getFoodMoveDataForTask(id: any) {
  return request({
    url: `/foodmove/getdata?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 11-清空新店铺
export function resetNewShop(id: any) {
  return request({
    url: `/foodmove/resetnewshop?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 通过门店id获取店铺对像
export function getShopWithOffId(id: any) {
  return request({
    url: `/foodmove/getshopwithoffid?officeid=${id}`,
    method: 'post',
    headers
  })
}

// 2-准备老店数据
export function beginData(id: any) {
  return request({
    url: `/foodmove/begindata?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 通过门店id获取店铺对像
// 已废弃：请使用 apiManager.foodmoveApi.QueryShops 替代
// export function queryShops(str: any, newShopType: ShopType) {
//   return request({
//     url: `/foodmove/queryshops?words=${str}&newShopType=${newShopType}`,
//     method: 'post',
//     headers
//   })
// }

// 获取分组下的商品列表
export function getGroupFoods(str: any) {
  const { taskid, groupid, page, pagesize, foodName } = str
  let url = `/foodmove/getgroupfoods?taskid=${taskid}&groupid=${groupid}&page=${page}&pagesize=${pagesize}`
  if (foodName) {
    url += `&foodName=${encodeURIComponent(foodName)}`
  }
  return request({
    url,
    method: 'post',
    headers
  })
}

// 通过门店id获取店铺对像
export function syncDecorate(id: any) {
  return request({
    url: `/foodmove/syncdecorate?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 1-创建任务
export function syncFoods(data: any) {
  return request({
    url: `/foodmove/syncfoods`,
    method: 'post',
    data,
    headers
  })
}

// 图片去水印
export function testOpencv4(data: any) {
  return request({
    url: `/foodmove/testopencv4?imgurl=${data}`,
    method: 'post',
    headers
  })
}

// 同步活动
export function syncActivity(data: any) {
  const { taskId, actType } = data
  return request({
    url: `/foodmove/syncactivitys?taskid=${taskId}&actType=${actType}`,
    method: 'post',
    headers
  })
}

// 查询商品复制任务进度
export function syncFoodsProgress(id: any) {
  return request({
    url: `/foodmove/syncfoodsprogress?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 更改商品
export function updateFood(data: any) {
  return request({
    url: `/foodmove/updaetfood`,
    method: 'post',
    data,
    headers
  })
}

// 获取商品复制日志
export function getFoodTaskLog(data: any) {
  const { succeed, taskid, page, pagesize } = data
  return request({
    url: `/foodmove/getfoodtasklog?succeed=${succeed}&taskid=${taskid}&page=${page}&pagesize=${pagesize}`,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function getTaskQuery(data: any) {
  const { shopOffId, page, pagesize } = data
  return request({
    url: `/foodmove/taskquery?page=${page}&pagesize=${pagesize}&shopOffId=${shopOffId}`,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function getActivityTaskLog(data: any) {
  const { succeed, taskid, page, pagesize, acttype } = data
  return request({
    url: `/foodmove/getactivitytasklog?succeed=${succeed}&taskid=${taskid}&page=${page}&pagesize=${pagesize}&acttype=${acttype}`,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function beachUpdateFoodPrice(data: any) {
  return request({
    url: `/foodmove/beachupdatefoodprice`,
    method: 'post',
    data,
    headers
  })
}
// 获取商品复制日志
export function resetOldShopData(id: any) {
  return request({
    url: `/foodmove/resetoldshopdata?taskid=${id}`,
    method: 'post',
    headers
  })
}
// 查询商品复制异常数量
export function foodFailCount(id: any) {
  return request({
    url: `/foodmove/foodfailcount?taskid=${id}`,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function getFoodTaskErrLog(data: any) {
  const { taskid, page, pagesize, foodName } = data
  let url = `/foodmove/GetFoodTaskErrLog?taskid=${taskid}&page=${page}&pagesize=${pagesize}`
  if (foodName) {
    url += `&foodName=${encodeURIComponent(foodName)}`
  }
  return request({
    url,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function queryFoodTask(data: any) {
  const { taskid, foodid } = data
  return request({
    url: `/foodmove/queryfoodtask?taskid=${taskid}&foodid=${foodid}`,
    method: 'post',
    headers
  })
}

// 获取商品复制日志
export function parseWxData(data: object) {
  var compressedData = globalThis.electron.brotliCompressBr(JSON.stringify(data))
  var setHead = { ...headers, 'Content-Type': 'application/json;charset=UTF-8', 'Content-Encoding': 'br' }
  console.log(setHead)
  return request({
    url: `/fooddataparse/parsewxdata`,
    method: 'post',

    data: compressedData,
    headers: setHead
  })
}
export const disposetask = (taskid: any) => {
  return request({
    url: `/foodmove/disposetask?taskid=${taskid}`,
    method: 'post',
    headers
  })
}

export const reportError = (taskId: string) => {
  return request({
    url: `/foodmove/reporttaskerror?taskId=${taskId}`,
    method: 'post',
    headers
  })
}
