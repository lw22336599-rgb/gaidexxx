<template>
  <div class="remote-browser">
    <div class="sidebar">
      <div class="sidebar-title">店铺列表</div>
      <div v-for="shop in shopList" :key="shop.id" class="shop-item" :class="{ active: selectedShop?.id === shop.id }"
        @click="selectShop(shop)">
        <PlatformIcon class="shop-icon" :shop-type="shop.shop_type" :size="18" />
        <span class="shop-name">{{ shop.name }}</span>
        <el-tag v-if="getShopState(shop.id)" :type="getShopStateTag(getShopState(shop.id))" size="small">
          {{ getShopStateText(getShopState(shop.id)) }}
        </el-tag>
      </div>
    </div>
    <div class="main">
      <div v-if="selectedShop" class="tabs-bar">
        <div v-for="page in pages" :key="page.PageKey" class="tab-item"
          :class="{ active: activePageKey === page.PageKey }" @click="activePageKey = page.PageKey">
          {{ page.DisplayName }}
        </div>
      </div>
      <div ref="viewportRef" class="viewport" @contextmenu.prevent="onViewportContextMenu($event)">
        <div v-if="!selectedShop" class="placeholder">请从左侧选择店铺</div>
        <div v-else-if="!isConnected" class="placeholder">
          {{
            connecting
              ? '正在连接远程浏览器...'
              : getShopState(selectedShop.id) === 'disconnected'
                ? '连接已断开，请重新选择店铺重连'
                : '连接失败，请重新选择店铺'
          }}
        </div>
        <div v-else class="webview-placeholder">
          <span>页面显示区域</span>
        </div>
      </div>
    </div>
    <div v-show="contextMenuVisible" class="context-menu" :style="contextMenuStyle" @click.stop>
      <div class="context-menu-item" @click="openInternalDevTools">
        打开开发工具（调试内部网页）
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { remoteBrowserManager } from '/@/services/remoteBrowser/RemoteBrowserManager'
import type { RemoteBrowserConnectionState } from '/@/services/remoteBrowser/RemoteBrowserManager'
import type { RemoteBrowserPageDescriptor } from '/@/TsModel/Alien/Entity/WebView/RemoteBrowserDtos'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type { ShopList_ResulItem } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem'
import { OrderDirection } from '/@/TsModel/Alien/Controllers/Shop/OrderDirection'

const route = useRoute()

const shopList = ref<ShopList_ResulItem[]>([])
const selectedShop = ref<ShopList_ResulItem | null>(null)
const connecting = ref(false)
const pages = ref<RemoteBrowserPageDescriptor[]>([])
const activePageKey = ref<string | null>(null)
const connectionStateVersion = ref(0)
/** 按店铺缓存已同步的页面，切换店铺时恢复 */
const pagesByShop = new Map<string, RemoteBrowserPageDescriptor[]>()
const viewportRef = ref<HTMLElement | null>(null)
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({ top: '0', left: '0' })

function onViewportContextMenu(e: MouseEvent) {
  if (!selectedShop.value || !isConnected.value) return
  contextMenuStyle.value = { top: `${e.clientY}px`, left: `${e.clientX}px` }
  contextMenuVisible.value = true
}

function openInternalDevTools() {
  const electron = (window as any).electron
  if (electron?.remoteBrowserOpenDevTools && selectedShop.value) {
    electron.remoteBrowserOpenDevTools(selectedShop.value.id, activePageKey.value)
  }
  closeContextMenu()
}

function closeContextMenu() {
  contextMenuVisible.value = false
}

function reportViewportBounds() {
  const el = viewportRef.value
  const electron = (window as any).electron
  if (!el || !electron?.remoteBrowserReportViewportBounds) return
  nextTick(() => {
    const rect = el.getBoundingClientRect()
    electron.remoteBrowserReportViewportBounds({
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    })
  })
}

const isConnected = computed(() => {
  connectionStateVersion.value
  if (!selectedShop.value) return false
  const info = remoteBrowserManager.getShopInfo(selectedShop.value.id)
  return info?.state === 'connected'
})

function getShopState(shopId: string): RemoteBrowserConnectionState | undefined {
  connectionStateVersion.value
  return remoteBrowserManager.getShopInfo(shopId)?.state
}

function getShopStateText(s: RemoteBrowserConnectionState): string {
  const map: Record<RemoteBrowserConnectionState, string> = {
    disconnected: '未连接',
    connecting: '连接中',
    connected: '已连接',
    failed: '失败',
  }
  return map[s] ?? ''
}

function getShopStateTag(s: RemoteBrowserConnectionState): string {
  if (s === 'connected') return 'success'
  if (s === 'connecting') return 'warning'
  if (s === 'failed') return 'danger'
  return 'info'
}

async function ensureShopCookies(shop: ShopList_ResulItem) {
  const electron = (window as any).electron
  if (!electron?.remoteBrowserSetShopCookies) return
  try {
    const cookies = await apiManager.shopmgApi.GetShopCk(shop.id)
    const ck = cookies?.replace(/^"|"$/g, '').trim()
    if (ck) await electron.remoteBrowserSetShopCookies(shop.id, ck, shop.shop_type ?? 0, shop.office_id ?? '')
  } catch {
    // 静默跳过
  }
}

async function selectShop(shop: ShopList_ResulItem) {
  selectedShop.value = shop
  const cached = pagesByShop.get(shop.id)
  pages.value = cached ?? []
  activePageKey.value = cached?.length ? cached[0].PageKey : null
  const info = remoteBrowserManager.getShopInfo(shop.id)
  if (info?.state !== 'connected') {
    connecting.value = true
    try {
      await ensureShopCookies(shop)
      const ok = await remoteBrowserManager.connect(shop.id, shop.shop_type ?? 0, shop.name ?? '')
      if (ok) {
        ElMessage.success('远程浏览器已连接')
      } else {
        ElMessage.error('连接失败')
      }
    } finally {
      connecting.value = false
    }
  }
}

let offClosing: (() => void) | null = null
let offNotify: (() => void) | null = null
let offStateChange: (() => void) | null = null

watch(
  [selectedShop, activePageKey, isConnected],
  () => {
    const electron = (window as any).electron
    if (!electron?.remoteBrowserShowPage || !selectedShop.value || !isConnected.value) return
    const pageKey = activePageKey.value ?? 'main'
    electron.remoteBrowserShowPage(selectedShop.value.id, pageKey)
  },
  { flush: 'post' }
)

onMounted(async () => {
  offStateChange = remoteBrowserManager.onStateChange(() => {
    connectionStateVersion.value++
  })

  const shopIdsParam = route.query.shopIds as string | undefined
  const shopIds = shopIdsParam ? shopIdsParam.split(',').map((s) => s.trim()).filter(Boolean) : []

  if (shopIds.length > 0) {
    const items = await apiManager.remoteBrowserApi.GetShopsForRemoteBrowser({ ShopIds: shopIds })
    shopList.value = items.map((item) => ({
      id: item.Id,
      name: item.Name,
      shop_type: item.ShopType,
      office_id: item.OfficeId ?? '',
    })) as ShopList_ResulItem[]
  } else {
    const res = await apiManager.shopmgApi.GetShopList({
      page: 1,
      pageSize: 100,
      order_direction: OrderDirection.Desc,
    })
    shopList.value = res.rows ?? []
  }

  if (shopList.value.length > 0) {
    selectedShop.value = shopList.value[0]
    connecting.value = true
    try {
      const shop = selectedShop.value
      await ensureShopCookies(shop)
      const ok = await remoteBrowserManager.connect(shop.id, shop.shop_type ?? 0, shop.name ?? '')
      if (ok) {
        ElMessage.success('远程浏览器已连接')
      } else {
        ElMessage.error('连接失败')
      }
    } finally {
      connecting.value = false
    }
  }

  offClosing = remoteBrowserManager.onClosing((dto) => {
    const electron = (window as any).electron
    if (electron?.remoteBrowserCloseShop) {
      electron.remoteBrowserCloseShop(dto.ShopId)
    }
    pagesByShop.delete(dto.ShopId)
    if (selectedShop.value?.id === dto.ShopId) {
      selectedShop.value = null
      pages.value = []
      activePageKey.value = null
    }
    ElMessage.warning(dto.Message ?? '远程浏览器会话已结束')
  })

  offNotify = remoteBrowserManager.onNotify((dto) => {
    ElNotification({
      title: '远程浏览器通知',
      message: dto.Message,
      type: (dto.Severity as 'success' | 'warning' | 'error' | 'info') ?? 'info',
    })
    if (dto.PlaySound) {
      try {
        const audio = new Audio('/sounds/notify.mp3')
        audio.play().catch(() => { })
      } catch {
        // ignore
      }
    }
  })

  remoteBrowserManager.onSyncPages((shopId, list) => {
    pagesByShop.set(shopId, list)
    if (selectedShop.value?.id === shopId) {
      pages.value = list
      if (list.length && !activePageKey.value) activePageKey.value = list[0].PageKey
    }
  })

  reportViewportBounds()
  viewportRo = new ResizeObserver(() => reportViewportBounds())
  document.addEventListener('click', closeContextMenu)
  nextTick(() => {
    if (viewportRef.value) viewportRo!.observe(viewportRef.value)
  })
  const interval = setInterval(reportViewportBounds, 300)
  setTimeout(() => clearInterval(interval), 8000)
})

let viewportRo: ResizeObserver | null = null
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
  viewportRo?.disconnect()
  offClosing?.()
  offNotify?.()
  offStateChange?.()
  remoteBrowserManager.onSyncPages(null)
})
</script>

<style scoped lang="scss">
.remote-browser {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .sidebar-title {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .shop-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .shop-icon {
      flex-shrink: 0;
    }

    &:hover {
      background: #f0f0f0;
    }

    &.active {
      background: #e6f4ff;
      color: #1677ff;
    }

    .shop-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.06);
}

.tabs-bar {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 12px 16px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
  position: relative;

  .tab-item {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: #f0f0f0;
      color: #1677ff;
    }

    &.active {
      background: #e6f4ff;
      color: #1677ff;
      font-weight: 500;
    }
  }
}

.viewport {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;

  .placeholder,
  .webview-placeholder {
    color: #999;
    font-size: 14px;
  }
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 180px;

  .context-menu-item {
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
    color: #333;

    &:hover {
      background: #f5f5f5;
      color: #1677ff;
    }
  }
}
</style>