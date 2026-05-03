/**
 * API 配置工具
 * 用于管理 SignalR 基础路径和配置变更监听
 */

/**
 * 获取 SignalR 基础路径
 * 从登录页配置的默认线路地址读取（localStorage.baseUrl.default）
 */
export const getSignalRBasePath = (): string => {
  try {
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      const baseUrlObj = JSON.parse(localBaseUrl)
      // 登录页写入的格式为 { default: 'http://xxx', move: 'http://xxx' }
      if (baseUrlObj && baseUrlObj.default) {
        return baseUrlObj.default
      }
    }
  } catch (error) {
    console.warn('解析 localStorage.baseUrl 失败:', error)
  }
  // 如果没有配置，返回空字符串（会使用相对路径）
  return ''
}

// API 配置变更监听
const apiConfigListeners: Array<() => void> = []

export const onApiConfigChange = (callback: () => void): void => {
  apiConfigListeners.push(callback)
}

export const triggerApiConfigChange = (): void => {
  apiConfigListeners.forEach(callback => callback())
}
