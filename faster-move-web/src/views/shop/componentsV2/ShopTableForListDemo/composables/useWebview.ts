// composables/useWebview.ts
import { ref, computed, type Ref } from 'vue'
import type { TabItem, WebviewItem, ShopData } from '../types'

export const useWebview = () => {
  const activeTab = ref<string>('home')
  const tabList = ref<TabItem[]>([{ id: 'home', label: '首页' }])
  const activeWebviews = ref<WebviewItem[]>([])
  const webviewRefs = new Map<string, any>()

  const showWebviewArea = computed(() => activeTab.value !== 'home' && activeWebviews.value.length > 0)

  const getWebviewUrl = (item: WebviewItem) => {
    switch (item.shop_type) {
      case 1:
        return 'https://e.waimai.meituan.com'
      case 3:
        return 'https://shangoue.meituan.com'
      case 4:
        return 'https://e.waimai.meituan.com'
      case 2:
        return `https://melody.shop.ele.me/app/shop/${item.office_id}/dashboard#app.shop.dashboard`
      case 5:
        return 'https://nr.ele.me'
      case 6:
        return 'https://store.jddj.com'
      case 7:
        return 'https://jsls.jinritemai.com'
      default:
        return ''
    }
  }

  const addWebviewTab = (shop: ShopData) => {
    const existingTab = tabList.value.find(t => t.id === shop.id)
    if (!existingTab) {
      tabList.value.push({
        id: shop.id,
        label: shop.name,
        muted: false
      })
      activeWebviews.value.push({
        ...shop,
        muted: false
      })
    }
    activeTab.value = shop.id
  }

  const removeTab = (tabId: string) => {
    tabList.value = tabList.value.filter(t => t.id !== tabId)
    activeWebviews.value = activeWebviews.value.filter(w => w.id !== tabId)
    webviewRefs.delete(tabId)
    if (activeTab.value === tabId) activeTab.value = 'home'
  }

  const setWebviewRef = (id: string, el: any) => {
    if (el) webviewRefs.set(id, el)
  }

  const toggleMute = (tabId: string) => {
    const tabIndex = tabList.value.findIndex(t => t.id === tabId)
    if (tabIndex > -1) {
      const newMuted = !tabList.value[tabIndex].muted
      tabList.value[tabIndex].muted = newMuted
      activeWebviews.value[tabIndex].muted = newMuted
      webviewRefs.get(tabId)?.setAudioMuted(newMuted)
    }
  }

  return {
    activeTab,
    tabList,
    activeWebviews,
    showWebviewArea,
    getWebviewUrl,
    addWebviewTab,
    removeTab,
    setWebviewRef,
    toggleMute
  }
}
