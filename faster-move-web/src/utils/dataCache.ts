/**
 * 通用数据缓存工具
 * 用于缓存不经常变化的数据，减少重复请求
 */

/**
 * 分组列表缓存
 */
let groupListCache: any[] | null = null
let groupListCacheTime: number = 0
const GROUP_LIST_CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

/**
 * 城市列表缓存
 */
let cityListCache: any[] | null = null
let cityListCacheTime: number = 0
const CITY_LIST_CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

/**
 * 绑定码缓存（按店铺ID）
 * key: shopId, value: { code: string, timestamp: number }
 */
const bindCodeCache = new Map<string, { code: string; timestamp: number }>()
const BIND_CODE_CACHE_DURATION = 4 * 60 * 1000 // 4分钟缓存（绑定码5分钟有效，提前1分钟刷新）

/**
 * 获取分组列表（带缓存）
 * @param fetchFn 获取数据的函数
 * @returns 分组列表
 */
export async function getCachedGroupList<T>(fetchFn: () => Promise<T>): Promise<T | null> {
  const now = Date.now()

  // 检查缓存是否有效
  if (groupListCache !== null && (now - groupListCacheTime) < GROUP_LIST_CACHE_DURATION) {
    return groupListCache as T
  }

  // 缓存失效，重新获取
  try {
    const data = await fetchFn()
    groupListCache = data as any
    groupListCacheTime = now
    return data
  } catch (error) {
    console.error('获取分组列表失败:', error)
    // 如果请求失败，返回旧缓存（如果有）
    return groupListCache as T | null
  }
}

/**
 * 获取城市列表（带缓存）
 * @param fetchFn 获取数据的函数
 * @returns 城市列表
 */
export async function getCachedCityList<T>(fetchFn: () => Promise<T>): Promise<T | null> {
  const now = Date.now()

  // 检查缓存是否有效
  if (cityListCache !== null && (now - cityListCacheTime) < CITY_LIST_CACHE_DURATION) {
    return cityListCache as T
  }

  // 缓存失效，重新获取
  try {
    const data = await fetchFn()
    cityListCache = data as any
    cityListCacheTime = now
    return data
  } catch (error) {
    console.error('获取城市列表失败:', error)
    // 如果请求失败，返回旧缓存（如果有）
    return cityListCache as T | null
  }
}

/**
 * 获取绑定码（带缓存）
 * @param shopId 店铺ID
 * @param fetchFn 获取绑定码的函数
 * @returns 绑定码
 */
export async function getCachedBindCode(
  shopId: string,
  fetchFn: () => Promise<{ code: string; data: any }>
): Promise<string | null> {
  const now = Date.now()
  const cached = bindCodeCache.get(shopId)

  // 检查缓存是否有效
  if (cached && (now - cached.timestamp) < BIND_CODE_CACHE_DURATION) {
    return cached.code
  }

  // 缓存失效，重新获取
  try {
    const result = await fetchFn()
    if (result.code === 200 && result.data) {
      const code = result.data
      bindCodeCache.set(shopId, { code, timestamp: now })
      return code
    }
    return null
  } catch (error) {
    console.error('获取绑定码失败:', error)
    // 如果请求失败，返回旧缓存（如果有）
    return cached?.code || null
  }
}

/**
 * 清除分组列表缓存
 */
export function clearGroupListCache(): void {
  groupListCache = null
  groupListCacheTime = 0
}

/**
 * 清除城市列表缓存
 */
export function clearCityListCache(): void {
  cityListCache = null
  cityListCacheTime = 0
}

/**
 * 清除绑定码缓存
 * @param shopId 店铺ID，如果不传则清除所有
 */
export function clearBindCodeCache(shopId?: string): void {
  if (shopId) {
    bindCodeCache.delete(shopId)
  } else {
    bindCodeCache.clear()
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  clearGroupListCache()
  clearCityListCache()
  clearBindCodeCache()
}
