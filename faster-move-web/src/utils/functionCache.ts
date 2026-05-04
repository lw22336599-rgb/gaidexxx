/**
 * 功能列表全局缓存工具
 * 使用全局变量缓存功能列表，不持久化到浏览器存储
 */

import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'
import type { ShopListFunctionColumnVo } from '@/TsModel/Alien/Controllers/Function/ShopListFunctionColumnVo'
import { apiManager } from '@/TsModel/Api/ApiManager'

/**
 * 功能列表缓存
 * key: shopType, value: t_wmt_function[]
 */
const functionListCache = new Map<ShopType, t_wmt_function[]>()

/**
 * 店铺列表功能列缓存（GetShopListFunctionColumns 的缓存）
 * key: shopType, value: ShopListFunctionColumnVo[]
 */
const shopListFunctionColumnsCache = new Map<ShopType, ShopListFunctionColumnVo[]>()

/**
 * 正在请求中的 Promise（防止并发重复请求）
 */
const functionListPendingRequests = new Map<ShopType, Promise<t_wmt_function[]>>()
const shopListFunctionColumnsPendingRequests = new Map<ShopType, Promise<ShopListFunctionColumnVo[]>>()

/**
 * 获取功能列表
 * 如果缓存中存在则直接返回，否则调用接口获取并缓存
 * 🚀 优化：防止并发重复请求
 * @param shopType 门店类型
 * @returns 功能列表
 */
export async function getFunctionList(shopType: ShopType): Promise<t_wmt_function[]> {
  // 1. 检查缓存
  if (functionListCache.has(shopType)) {
    console.log('🚀 [getFunctionList] 使用缓存，shopType:', shopType)
    return functionListCache.get(shopType)!
  }

  // 2. 检查是否有正在进行的请求
  if (functionListPendingRequests.has(shopType)) {
    console.log('⏳ [getFunctionList] 等待进行中的请求，shopType:', shopType)
    return functionListPendingRequests.get(shopType)!
  }

  // 3. 发起新请求
  console.log('📡 [getFunctionList] 发起新请求，shopType:', shopType)
  const requestPromise = apiManager.functionpriceApi
    .GetFuncList(shopType)
    .then(funcList => {
      // 请求成功，缓存结果
      functionListCache.set(shopType, funcList)
      // 移除pending标记
      functionListPendingRequests.delete(shopType)
      return funcList
    })
    .catch(error => {
      // 请求失败，移除pending标记
      functionListPendingRequests.delete(shopType)
      throw error
    })

  // 4. 标记为进行中
  functionListPendingRequests.set(shopType, requestPromise)

  return requestPromise
}

/**
 * 获取店铺列表功能列（用于决定显示哪些功能列及是否展示「设置」入口）
 * 如果缓存中存在则直接返回，否则调用 GetShopListFunctionColumns 并缓存
 * 🚀 优化：防止并发重复请求
 * @param shopType 平台/门店类型
 * @returns ShopListFunctionColumnVo[]
 */
export async function getShopListFunctionColumns(shopType: ShopType): Promise<ShopListFunctionColumnVo[]> {
  // 1. 检查缓存
  if (shopListFunctionColumnsCache.has(shopType)) {
    console.log('🚀 [getShopListFunctionColumns] 使用缓存，shopType:', shopType)
    return shopListFunctionColumnsCache.get(shopType)!
  }

  // 2. 检查是否有正在进行的请求
  if (shopListFunctionColumnsPendingRequests.has(shopType)) {
    console.log('⏳ [getShopListFunctionColumns] 等待进行中的请求，shopType:', shopType)
    return shopListFunctionColumnsPendingRequests.get(shopType)!
  }

  // 3. 发起新请求
  console.log('📡 [getShopListFunctionColumns] 发起新请求，shopType:', shopType)
  const requestPromise = apiManager.functionappApi
    .GetShopListFunctionColumns(shopType)
    .then(list => {
      // 请求成功，缓存结果
      shopListFunctionColumnsCache.set(shopType, list)
      // 移除pending标记
      shopListFunctionColumnsPendingRequests.delete(shopType)
      return list
    })
    .catch(error => {
      // 请求失败，移除pending标记
      shopListFunctionColumnsPendingRequests.delete(shopType)
      throw error
    })

  // 4. 标记为进行中
  shopListFunctionColumnsPendingRequests.set(shopType, requestPromise)

  return requestPromise
}

/**
 * 续费功能列表项（用于各续费选择 UI）
 */
export interface RenewFunctionOption {
  code: string
  /** 显示名：优先取 renew_name，为空时用 name */
  name: string
  /** 原始功能名称（用于传 GetFunctionPrices 接口的 priceTitle 参数） */
  rawName: string
}

/**
 * 获取用于续费 UI 的功能列表（已过滤 show_renew_btn=false 的项，名称使用 renew_name ?? name）
 * @param shopType 门店类型
 * @returns 可续费功能选项列表
 */
export async function getRenewFunctionList(shopType: ShopType): Promise<RenewFunctionOption[]> {
  const funcList = await getFunctionList(shopType)
  return funcList
    .filter(func => func.show_renew_btn !== false)
    .map(func => ({
      code: func.code,
      name: func.renew_name || func.name,
      rawName: func.name
    }))
}

/**
 * 检查功能是否存在
 * @param shopType 门店类型
 * @param funcCode 功能代码
 * @returns 功能是否存在
 */
export async function hasFunction(shopType: ShopType, funcCode: string): Promise<boolean> {
  const funcList = await getFunctionList(shopType)
  return funcList.some(func => func.code === funcCode)
}

/**
 * 清除缓存
 * @param shopType 门店类型，如果不传则清除所有缓存
 */
export function clearCache(shopType?: ShopType): void {
  if (shopType) {
    functionListCache.delete(shopType)
    shopListFunctionColumnsCache.delete(shopType)
  } else {
    functionListCache.clear()
    shopListFunctionColumnsCache.clear()
  }
}
