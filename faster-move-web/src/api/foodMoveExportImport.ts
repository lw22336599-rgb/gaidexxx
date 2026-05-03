/**
 * 商品搬家导出/导入 API（使用复制线路 move）
 * 因涉及文件下载和上传，单独实现，不依赖 TsModel 自动生成
 */
import { apiManager } from '@/TsModel/Api/ApiManager'

/** 导出时可传入的命名参数 */
export interface ExportFilenameOptions {
  /** 店铺类型名（如 美团、饿了么） */
  shopTypeName?: string
  /** 店铺名称 */
  shopName?: string
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|\x00-\x1f]/g

function sanitizeFilenamePart(s: string, maxLen = 50): string {
  if (!s || typeof s !== 'string') return ''
  return s
    .replace(INVALID_FILENAME_CHARS, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen) || '未命名'
}

/**
 * 导出任务商品数据为 .fdmv 压缩加密包
 * @param taskId 任务ID
 * @param options 可选，用于生成有意义的文件名：店铺类型+店铺名+导出日期
 * @returns 下载文件名
 */
export async function exportTaskFoodData(
  taskId: string,
  options?: ExportFilenameOptions
): Promise<string> {
  const axios = apiManager.getAxiosInstance()
  const moveBaseUrl = apiManager.getMoveBaseUrl()
  const url = `${moveBaseUrl}/FoodMove/ExportTaskFoodData`

  const response = await axios({
    method: 'POST',
    url,
    params: { taskId },
    responseType: 'blob',
  })

  const blob = response.data as Blob
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

  let filename: string
  if (options?.shopTypeName || options?.shopName) {
    const typePart = sanitizeFilenamePart(options.shopTypeName ?? '')
    const namePart = sanitizeFilenamePart(options.shopName ?? '')
    const parts = [typePart, namePart].filter(Boolean)
    filename = `${parts.join('_')}_${dateStr}.fdmv`
  } else {
    filename = `商品数据_${taskId}_${dateStr}.fdmv`
  }

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
  return filename
}

/** 导入结果 */
export interface ImportTaskFoodDataResult {
  taskId: string
  groupCount: number
  foodCount: number
  activityCount: number
  decorationCount: number
}

/**
 * 导入 .fdmv 包到新店，有任务则重置后导入，无任务则创建后导入
 * @param newShopId 新店ID（t_wmt_shop_list.id）
 * @param file .fdmv 导出包文件
 */
export async function importTaskFoodData(
  newShopId: string,
  file: File
): Promise<ImportTaskFoodDataResult> {
  const axios = apiManager.getAxiosInstance()
  const moveBaseUrl = apiManager.getMoveBaseUrl()
  const url = `${moveBaseUrl}/FoodMove/ImportTaskFoodData`

  const formData = new FormData()
  formData.append('newShopId', newShopId)
  formData.append('packageFile', file)

  const response = await axios({
    method: 'POST',
    url,
    params: { newShopId },
    data: formData,
  })

  const data = response.data as ImportTaskFoodDataResult
  return data
}
