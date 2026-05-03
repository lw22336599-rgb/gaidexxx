import { defineStore } from 'pinia'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type { SystemConfigAllDto } from '/@/TsModel/Alien/Entity/Function/SystemConfig/SystemConfigAllDto'

const CACHE_KEY = 'systemConfigAllDtoCache'

export const useSystemConfigStore = defineStore('systemConfig', {
  state: (): { config: SystemConfigAllDto | null; fetched: boolean } => ({
    config: null,
    fetched: false,
  }),
  getters: {
    getConfig: (state) => state.config,
    getShopManagePlatforms: (state) => state.config?.ShopManagePlatforms || [],
    getShopCopyPlatforms: (state) => state.config?.ShopCopyPlatforms || [],
    getShopResearchPlatforms: (state) => state.config?.ShopResearchPlatforms || [],
    getCustomerServiceUrl: (state) => state.config?.CustomerServiceUrl || '',
    getDownloadUrl: (state) => state.config?.DownloadUrl || '',
    getBusinessContact: (state) => state.config?.BusinessContact || '',
  },
  actions: {
    loadCache(): SystemConfigAllDto | null {
      const cache = localStorage.getItem(CACHE_KEY)
      if (!cache) return null
      const parsed = JSON.parse(cache) as SystemConfigAllDto
      this.config = parsed
      return parsed
    },
    saveCache(config: SystemConfigAllDto) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(config))
    },
    async ensureConfig(force = false): Promise<SystemConfigAllDto> {
      // 先快速填充缓存，后面仍会走接口刷新，避免后端更新后浏览器不更新
      if (!this.config) this.loadCache()

      if (force || !this.fetched) {
        const result = await apiManager.systemconfigApi.GetAllConfig()
        this.config = result
        this.saveCache(result)
        this.fetched = true
        return result
      }

      if (this.config) return this.config

      // 极端情况缓存为空且非强制，兜底拉取
      const result = await apiManager.systemconfigApi.GetAllConfig()
      this.config = result
      this.saveCache(result)
      this.fetched = true
      return result
    },
    updateConfigCache(config: SystemConfigAllDto) {
      this.config = config
      this.fetched = true
      this.saveCache(config)
    },
  },
})
