<template>
  <div class="shop-backend-manager">
    <!-- 左侧平台类型导航 -->
    <div class="platform-sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <h3 v-show="!isCollapsed">店铺平台</h3>
        <el-button class="collapse-btn" circle size="small" @click="toggleSidebar">
          <el-icon>
            <DArrowLeft v-if="!isCollapsed" />
            <DArrowRight v-else />
          </el-icon>
        </el-button>
      </div>
      <div class="platform-list">
        <!-- 全部按钮 -->
        <el-tooltip :content="`全部 (${shops.length}家店铺)`" placement="right" :disabled="!isCollapsed">
          <div class="platform-item all-platform" :class="{ active: selectedPlatform === -1 && !selectedTempGroupId }"
            @click="selectPlatform(-1)">
            <div class="platform-icon">
              <el-icon :size="20">
                <Grid />
              </el-icon>
            </div>
            <div v-show="!isCollapsed" class="platform-info">
              <div class="platform-name">全部</div>
              <div class="shop-count">{{ shops.length }}家店铺</div>
            </div>
          </div>
        </el-tooltip>

        <!-- 各平台 -->
        <el-tooltip v-for="platform in platforms" :key="platform.type"
          :content="`${platform.name} (${platform.count}家店铺)`" placement="right" :disabled="!isCollapsed">
          <div class="platform-item" :class="{ active: selectedPlatform === platform.type && !selectedTempGroupId }"
            @click="selectPlatform(platform.type)">
            <div class="platform-icon">
              <vab-icon :icon="platform.icon" is-custom-svg />
            </div>
            <div v-show="!isCollapsed" class="platform-info">
              <div class="platform-name">{{ platform.name }}</div>
              <div class="shop-count">{{ platform.count }}家店铺</div>
            </div>
          </div>
        </el-tooltip>
      </div>

      <!-- 临时分组区域 -->
      <div ref="tempGroupsSectionRef" class="temp-groups-section" :class="{ collapsed: isCollapsed }">
        <div class="temp-groups-header">
          <span v-show="!isCollapsed" class="section-title">-------临时分组-------</span>
        </div>
        <div v-show="!isCollapsed" class="temp-groups-list">
          <!-- 快速创建分组：固定在列表顶部 -->
          <div class="temp-groups-add-input temp-groups-add-input--inlist">
            <div style="position: relative;">
              <el-input v-model="newTempGroupName" placeholder="输入分组名按回车" size="small" @keyup.enter="quickAddTempGroup">
                <template #suffix>
                  <el-icon class="input-icon" @click="quickAddTempGroup">
                    <Plus />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </div>
          <div v-for="group in tempGroups" :key="group.id" class="temp-group-item"
            :class="{ 'drag-over': dragOverGroupId === group.id }" @drop="handleDropToTempGroup($event, group.id)"
            @dragover.prevent="handleDragOver($event, group.id)" @dragleave="handleDragLeave">
            <div class="temp-group-content" @drop.stop.prevent="handleDropToTempGroup($event, group.id)"
              @dragover.prevent="handleDragOver($event, group.id)" @dragleave="handleDragLeave">
              <template v-if="editingTempGroupId === group.id">
                <div class="temp-group-edit-wrapper" @click.stop>
                  <el-input v-model="editingTempGroupName" size="small" maxlength="20" autofocus
                    class="temp-group-edit-input" @keyup.enter="saveInlineTempGroupName" @blur="saveInlineTempGroupName"
                    @keydown.esc.stop.prevent="cancelInlineTempGroupName" />
                </div>
              </template>
              <template v-else>
                <div class="temp-group-view" @click="viewTempGroupShops(group)">
                  <span class="temp-group-name" :title="group.name">{{ group.name }}</span>
                  <span class="temp-group-count">({{ getTempGroupShopCount(group.id) }})</span>
                </div>
              </template>
            </div>
            <div class="temp-group-actions" @drop.stop.prevent="handleDropToTempGroup($event, group.id)"
              @dragover.prevent="handleDragOver($event, group.id)" @dragleave="handleDragLeave">
              <el-button type="text" size="small" @click.stop="editTempGroup(group)">
                <el-icon>
                  <Edit />
                </el-icon>
              </el-button>
              <el-button type="text" size="small" @click.stop="deleteTempGroup(group.id)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </div>
          <div v-if="tempGroups.length === 0" class="temp-groups-empty">
            <el-empty description="暂无临时分组" :image-size="60" />
          </div>
        </div>
        <div v-show="!isCollapsed" class="temp-groups-tip">
          拖拽店铺标签到临时分组
        </div>
      </div>

      <!-- 分组管理按钮 -->
      <div class="sidebar-footer">
        <el-tooltip content="分组管理" placement="right" :disabled="!isCollapsed">
          <el-button type="primary" plain size="small" @click="openGroupManager" :style="{ width: '100%' }">
            <el-icon v-if="isCollapsed">
              <Folder />
            </el-icon>
            <span v-else>分组管理</span>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 右侧店铺后台区域 -->
    <div class="main-content">
      <div v-if="currentPlatformShops.length > 0" class="content-wrapper">
        <!-- 标签栏 -->
        <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab" @tab-click="handleTabClick">
          <el-tab-pane v-for="shop in currentPlatformShops" :key="shop.id" :label="shop.name" :name="shop.id">
            <template #label>
              <span class="tab-label" draggable="true" @dragstart="handleTabDragStart($event, shop.id)"
                @dragend="handleTabDragEnd" @dblclick.stop="removeTab(shop.id)">
                <PlatformIcon :shop-type="shop.shop_type" :size="14" custom-class="tab-platform-icon" />
                <span class="tab-shop-name">{{ shop.name }}</span>
                <span class="mute-icon-wrapper" @click.stop="toggleMute(shop.id)">
                  <el-icon class="mute-icon" :class="{ 'is-muted': shop.muted }">
                    <BellFilled v-if="shop.muted" />
                    <Bell v-else />
                  </el-icon>
                  <span v-if="shop.muted" class="mute-slash"></span>
                </span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- Webview 显示区域（保持所有 webview 存在，避免切换平台时重新加载） -->
        <div class="webview-display-area">
          <div v-for="shop in shops" v-show="activeTab === shop.id" :key="shop.id" style="width: 100%; height: 100%;">
            <webview :id="'webview' + shop.id" allowpopups="true" allowtransparency="true" nodeintegration="true"
              :partition="'persist:webview_' + shop.id" plugins="true" :src="getShopUrl(shop)"
              style="width: 100%; height: 100%;"
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
              webpreferences="nativeWindowOpen=yes, spellcheck=no, contextIsolation=no" />
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-else class="empty-state">
        <el-empty :description="getEmptyDescription()">
        </el-empty>
      </div>
    </div>

    <!-- 添加临时分组对话框 -->
    <el-dialog v-model="addTempGroupDialogVisible" title="添加临时分组" width="400px" :close-on-click-modal="false">
      <el-form :model="tempGroupForm" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="tempGroupForm.name" placeholder="请输入分组名称" maxlength="20" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addTempGroupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTempGroup">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看临时分组店铺对话框 -->
    <el-dialog v-model="viewTempGroupDialogVisible" :title="`${selectedTempGroupName} - 店铺列表`" width="600px"
      :close-on-click-modal="true">
      <div class="temp-group-shops-list">
        <el-scrollbar height="400px">
          <div v-if="selectedTempGroupShops.length === 0" class="empty-container">
            <el-empty description="该临时分组暂无店铺" :image-size="80" />
          </div>
          <div v-else class="shop-items">
            <div v-for="shop in selectedTempGroupShops" :key="shop.id" class="shop-item">
              <div class="shop-item-content">
                <div class="shop-info">
                  <PlatformIcon :shop-type="shop.shop_type" :size="18" custom-class="shop-platform-icon" />
                  <div class="shop-details">
                    <div class="shop-name">{{ shop.name }}</div>
                    <div class="shop-meta">
                      <span>ID: {{ shop.office_id }}</span>
                    </div>
                  </div>
                </div>
                <div class="shop-actions">
                  <el-button type="primary" size="small" @click="openShopFromTempGroup(shop)">
                    <el-icon style="margin-right: 4px">
                      <View />
                    </el-icon>
                    打开后台
                  </el-button>
                  <el-button type="danger" size="small" @click="removeShopFromTempGroup(shop.id)">
                    <el-icon style="margin-right: 4px">
                      <Delete />
                    </el-icon>
                    移除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>

    <!-- 分组管理对话框 -->
    <el-dialog v-model="groupManagerVisible" title="分组管理" width="900px" :close-on-click-modal="false"
      class="group-manager-dialog">
      <div class="group-manager-content">
        <!-- 左侧分组列表 -->
        <div class="group-list-panel">
          <div class="panel-header">
            <span class="panel-title">分组列表</span>
            <el-button type="primary" size="small" @click="refreshGroupList">
              <el-icon style="margin-right: 4px">
                <Refresh />
              </el-icon>
              刷新
            </el-button>
          </div>
          <div class="group-list-container">
            <el-scrollbar height="500px">
              <div v-if="groupListLoading" class="loading-container">
                <el-icon class="is-loading" :size="24">
                  <Loading />
                </el-icon>
                <span style="margin-left: 8px">加载中...</span>
              </div>
              <div v-else-if="flatGroupList.length === 0" class="empty-container">
                <el-empty description="暂无分组" :image-size="80" />
              </div>
              <div v-else class="group-items">
                <div v-for="group in flatGroupList" :key="group.id" class="group-item"
                  :class="{ active: selectedGroupId === group.id }" @click="selectGroup(group)">
                  <div class="group-item-content">
                    <el-icon class="group-icon">
                      <Folder />
                    </el-icon>
                    <span class="group-name">{{ group.name }}</span>
                    <span class="group-shop-count">({{ group.shopCount || 0 }})</span>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>

        <!-- 右侧店铺列表 -->
        <div class="shop-list-panel">
          <div class="panel-header">
            <span class="panel-title">
              {{ selectedGroupName ? `${selectedGroupName} - 店铺列表` : '请选择分组' }}
            </span>
            <div v-if="selectedGroupId" class="panel-actions">
              <el-button type="success" size="small" :disabled="selectedShops.length === 0" @click="openAllShops">
                <el-icon style="margin-right: 4px">
                  <CircleCheck />
                </el-icon>
                全部打开 ({{ selectedShops.length }})
              </el-button>
            </div>
          </div>
          <div class="shop-list-container">
            <el-scrollbar height="500px">
              <div v-if="shopListLoading" class="loading-container">
                <el-icon class="is-loading" :size="24">
                  <Loading />
                </el-icon>
                <span style="margin-left: 8px">加载中...</span>
              </div>
              <div v-else-if="!selectedGroupId" class="empty-container">
                <el-empty description="请从左侧选择分组查看店铺" :image-size="80" />
              </div>
              <div v-else-if="selectedShops.length === 0" class="empty-container">
                <el-empty description="该分组暂无店铺" :image-size="80" />
              </div>
              <div v-else class="shop-items">
                <div v-for="shop in selectedShops" :key="shop.id" class="shop-item">
                  <div class="shop-item-content">
                    <div class="shop-info">
                      <PlatformIcon :shop-type="shop.shop_type" :size="18" custom-class="shop-platform-icon" />
                      <div class="shop-details">
                        <div class="shop-name">{{ shop.name }}</div>
                        <div class="shop-meta">
                          <span>ID: {{ shop.office_id }}</span>
                          <span v-if="shop.city" class="shop-city">{{ shop.city }}</span>
                        </div>
                      </div>
                    </div>
                    <el-button type="primary" size="small" @click="openShop(shop)">
                      <el-icon style="margin-right: 4px">
                        <View />
                      </el-icon>
                      打开后台
                    </el-button>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Bell, BellFilled, Grid, DArrowLeft, DArrowRight, Close, Folder, Refresh, Loading, CircleCheck, View, Plus, Edit, Delete } from '@element-plus/icons-vue'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import Sortable from 'sortablejs'
import { getGroup } from '/@/api/shop'
import { getBindShopList } from '/@/api/group'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab'

interface Shop {
  id: string
  name: string
  office_id: string
  shop_type: number
  cookies: string
  muted: boolean
}

interface Platform {
  type: number
  name: string
  icon: string
  count: number
}

const shops = ref<Shop[]>([])
const activeTab = ref<string>('')
const selectedPlatform = ref<number | null>(null) // null 表示未选择，-1 表示"全部"
const initializedWebviews = new Set<string>()
const isCollapsed = ref(false) // 侧边栏折叠状态
const platformOrder = ref<number[]>([]) // 平台排序顺序
const platformLastActiveTab = ref<Record<number, string>>({}) // 每个平台最后激活的标签

// 临时分组：这些状态会在 computed 中使用，必须在使用前声明，避免初始化阶段 ReferenceError 导致白屏
const selectedTempGroupId = ref<string | null>(null)
const selectedTempGroupName = ref<string>('')
const tempGroupShops = ref<TempGroupShop[]>([])

// 分组管理相关
const groupManagerVisible = ref(false)
const groupListLoading = ref(false)
const shopListLoading = ref(false)
const groupList = ref<any[]>([])
const flatGroupList = ref<any[]>([])
const selectedGroupId = ref<string | null>(null)
const selectedGroupName = ref<string>('')
const selectedShops = ref<any[]>([])

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 日志工具（开发环境显示详细信息，生产环境只显示错误）
const isDev = import.meta.env.DEV
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[店铺后台管理器] ${message}`, error || '')
  },
  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[店铺后台管理器] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[店铺后台管理器] ${message}`, ...args)
    }
  }
}

// 平台配置
const platformConfig: Record<number, { name: string; icon: string }> = {
  1: { name: '美团餐饮', icon: 'mt' },
  2: { name: '饿了么餐饮', icon: 'elm' },
  3: { name: '美团闪购', icon: 'mt-shop' },
  4: { name: '美团医药', icon: 'mt-medicine' },
  5: { name: '饿百零售', icon: 'tbsg_ls' },
  6: { name: '京东到家', icon: 'jd-home' },
  7: { name: '抖音即时零售', icon: 'dy-retail' },
  8: { name: '饿了么复制版', icon: 'elm' },
  1000: { name: '美团团购', icon: 'mt' },
  1001: { name: '京东团购', icon: 'jd-home' }
}

// 计算已打开的平台列表
const platforms = computed<Platform[]>(() => {
  const platformMap = new Map<number, number>()

  // 统计每个平台的店铺数量
  shops.value.forEach(shop => {
    const count = platformMap.get(shop.shop_type) || 0
    platformMap.set(shop.shop_type, count + 1)
  })

  // 转换为平台列表
  const result: Platform[] = []
  platformMap.forEach((count, type) => {
    const config = platformConfig[type]
    if (config) {
      result.push({
        type,
        name: config.name,
        icon: config.icon,
        count
      })
    }
  })

  // 如果有自定义排序，按照自定义顺序排列
  if (platformOrder.value.length > 0) {
    result.sort((a, b) => {
      const indexA = platformOrder.value.indexOf(a.type)
      const indexB = platformOrder.value.indexOf(b.type)
      // 如果都在排序列表中，按索引排序
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      // 如果只有一个在排序列表中，在列表中的排前面
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      // 都不在列表中，保持原顺序
      return 0
    })
  }

  return result
})

// 当前选中平台的店铺列表
const currentPlatformShops = computed<Shop[]>(() => {
  // 如果选中了临时分组，只显示该分组内的店铺
  if (selectedTempGroupId.value) {
    const groupShopIds = new Set(
      tempGroupShops.value
        .filter(s => s.groupId === selectedTempGroupId.value)
        .map(s => s.shopId)
    )
    return shops.value.filter(shop => groupShopIds.has(shop.id))
  }

  if (selectedPlatform.value === null) {
    // 未选择平台，不显示任何店铺
    return []
  }
  if (selectedPlatform.value === -1) {
    // 显示所有店铺
    return shops.value
  }
  // 显示指定平台的店铺
  return shops.value.filter(shop => shop.shop_type === selectedPlatform.value)
})

// 选择平台
const selectPlatform = (platformType: number) => {
  // 清除临时分组选择状态
  selectedTempGroupId.value = null
  selectedTempGroupName.value = ''

  // 保存当前平台的激活标签
  if (selectedPlatform.value !== null && activeTab.value) {
    platformLastActiveTab.value[selectedPlatform.value] = activeTab.value
  }

  // 切换平台
  selectedPlatform.value = platformType

  // 尝试恢复该平台之前激活的标签
  const lastActiveTabId = platformLastActiveTab.value[platformType]
  const platformShops = currentPlatformShops.value

  if (lastActiveTabId && platformShops.some(shop => shop.id === lastActiveTabId)) {
    // 如果之前有激活的标签，且该标签仍然存在，恢复到该标签
    activeTab.value = lastActiveTabId
  } else {
    // 否则切换到该平台的第一个店铺
    const firstShop = platformShops[0]
    if (firstShop) {
      activeTab.value = firstShop.id
    }
  }
}

// 获取空状态描述
const getEmptyDescription = (): string => {
  if (shops.value.length === 0) {
    return '暂无打开的店铺后台，点击主窗口的"打开后台"按钮添加店铺'
  }
  if (selectedPlatform.value === null) {
    return '请从左侧选择平台查看店铺'
  }
  if (selectedPlatform.value === -1) {
    return '请从左侧选择具体平台'
  }
  return '当前平台暂无打开的店铺'
}

// 获取店铺后台 URL
const getShopUrl = (shop: Shop): string => {
  const urlMap: Record<number, string> = {
    1: 'https://e.waimai.meituan.com', // 美团餐饮
    2: `https://melody.shop.ele.me/app/shop/${shop.office_id}/dashboard#app.shop.dashboard`, // 饿了么餐饮
    3: 'https://shangoue.meituan.com', // 美团闪购
    4: 'https://yiyao.meituan.com/main/frame', // 美团医药
    5: 'https://nr.ele.me', // 饿百零售
    6: 'https://store.jddj.com', // 京东到家
    7: 'https://jsls.jinritemai.com', // 抖音即时零售
    1000: 'https://ecom.meituan.com/meishi/', // 美团团购
    1001: 'https://store.jddj.com', // 京东团购（暂用京东到家地址）
  }
  return urlMap[shop.shop_type] || ''
}

// 各平台快捷入口配置
// shopType: 1=美团外卖, 2=饿了么外卖, 3=美团闪购, 4=美团医药, 5=饿百零售, 6=京东到家, 7=抖店即时零售
const getShortcutUrls = (shop: Shop) => {
  const officeId = shop.office_id
  const shortcuts: Record<number, Record<string, string | null>> = {
    // 美团外卖
    1: {
      product: 'https://e.waimai.meituan.com/#/gw/static_resource/product#/listView',
      activity: 'https://e.waimai.meituan.com/#https://waimaieapp.meituan.com/igate/wmactpc/my',
      order: 'https://e.waimai.meituan.com/#/new_fe/orderbusiness#/order/history',
      promote: 'https://e.waimai.meituan.com/#https://waimaieapp.meituan.com/ad/v1/rpc'
    },
    // 饿了么外卖
    2: {
      product: `https://melody.shop.ele.me/app/shop/${officeId}/food#app.shop.food?path=management`,
      activity: `https://melody.shop.ele.me/app/shop/${officeId}/activity__myActivity#app.shop.activity.myActivity`,
      order: `https://melody.shop.ele.me/app/shop/${officeId}/order__querying#app.shop.order.querying`,
      promote: `https://melody.shop.ele.me/app/shop/${officeId}/vas#app.shop.vas`
    },
    // 美团闪购
    3: {
      product: 'https://shangoue.meituan.com/#/reuse/sc/product/views/product/list',
      activity: 'https://shangoue.meituan.com/#https://waimaieapp.meituan.com/marketing/shangou/activity/pc/merchant/myActivity',
      order: 'https://shangoue.meituan.com/#/page/orderbusiness#/order/history',
      promote: 'https://shangoue.meituan.com/#https://waimaieapp.meituan.com/ad/v1/rpc'
    },
    // 美团医药
    4: {
      product: 'https://yiyao.meituan.com/main/frame#/page/product/list/single',
      activity: 'https://yiyao.meituan.com/main/frame#/pages/health/marketing/activity-manage/manage',
      order: 'https://yiyao.meituan.com/main/frame#/page/orderbusiness#/order/history',
      promote: 'https://yiyao.meituan.com/main/frame#https://waimaieapp.meituan.com/ad/v1/pc'
    },
    // 饿百零售
    5: {
      product: 'https://nr.ele.me/app/eleme-nr-bfe-newretail/common-next#/pc/storeCommodityManagementPc/',
      activity: 'https://nr.ele.me/app/eleme-nr-bfe-newretail/common-next#/pc/shopActivitiesNextPc/batchManage?activityType=101&defaultTab=activityList',
      order: 'https://nr.ele.me/app/eleme-nr-bfe-newretail/common-next#/pc/orderRecordPc/record',
      promote: 'https://nr.ele.me/app/eleme-nr-bfe-newretail/common-next#/pc/newShopPromotionPc/'
    },
    // 京东到家
    6: {
      product: 'https://store.jddj.com/product/sku/index',
      activity: 'https://store.jddj.com/plus/promotion/myActivities/index',
      order: 'https://store.jddj.com/plus/order/all',
      promote: null // 不支持
    },
    // 抖店即时零售 - 暂不支持
    7: {
      product: null,
      activity: null,
      order: null,
      promote: null
    },
    // 饿了么官方
    8: {
      product: `https://melody.shop.ele.me/app/shop/${officeId}/food#app.shop.food?path=management`,
      activity: `https://melody.shop.ele.me/app/shop/${officeId}/activity__myActivity#app.shop.activity.myActivity`,
      order: `https://melody.shop.ele.me/app/shop/${officeId}/order__querying#app.shop.order.querying`,
      promote: `https://melody.shop.ele.me/app/shop/${officeId}/vas#app.shop.vas`
    },
    // 美团团购 - 暂不支持快捷入口
    1000: {
      product: null,
      activity: null,
      order: null,
      promote: null
    },
    // 京东团购 - 暂用京东到家的快捷入口
    1001: {
      product: 'https://store.jddj.com/product/sku/index',
      activity: 'https://store.jddj.com/plus/promotion/myActivities/index',
      order: 'https://store.jddj.com/plus/order/all',
      promote: null
    }
  }

  return shortcuts[shop.shop_type] || {}
}

// 添加新店铺
const addShop = async (shopData: Shop) => {
  // 检查是否为饿了么复制版（shop_type = 8），该类型不支持打开后台
  if (shopData.shop_type === 8) {
    logger.error('饿了么复制版不支持打开后台')
    // 注意：这里无法使用 gp.$baseMessage，因为是在独立窗口中
    // 可以通过其他方式通知主窗口
    if ((globalThis as any).electron?.showMessageBox) {
      (globalThis as any).electron.showMessageBox({
        type: 'warning',
        title: '不支持的店铺类型',
        message: '饿了么复制版不支持打开后台，请使用饿了么餐饮绑定店铺'
      })
    }
    return
  }

  // 检查是否已存在
  const existingShop = shops.value.find(s => s.id === shopData.id)
  if (existingShop) {
    // 如果已存在，切换到该店铺所在平台和标签
    selectedPlatform.value = existingShop.shop_type
    activeTab.value = shopData.id
    return
  }

  // 关键：先设置 cookies，再创建 webview，确保 webview 创建时就能使用正确的 cookies 加载页面
  try {
    await setShopCookies(shopData)
  } catch (error) {
    logger.error(`设置店铺 "${shopData.name}" cookies 失败`, error)
  }

  // 添加新店铺（此时会创建 webview 并自动使用已设置的 cookies 加载 URL）
  shops.value.push({
    ...shopData,
    muted: true
  })

  // 设置平台和激活标签
  selectedPlatform.value = shopData.shop_type
  activeTab.value = shopData.id
  initializedWebviews.add(shopData.id)

  // 等待 webview 创建后设置初始静音状态和右键菜单
  await nextTick()
  setTimeout(() => {
    setupWebviewAudio(shopData.id, true)
    setupWebviewContextMenu(shopData.id)
  }, 200)
}

// 平台 cookies 域名配置
const platformCookieDomains: Record<number, string[]> = {
  1: ['https://e.waimai.meituan.com'], // 美团餐饮
  2: ['https://melody.shop.ele.me'], // 饿了么餐饮
  3: [ // 美团闪购
    'https://shangoue.meituan.com',
    'https://e.waimai.meituan.com',
    'https://waimaie.meituan.com'
  ],
  4: [ // 美团医药
    'https://yiyao.meituan.com',
    'https://e.waimai.meituan.com',
    'https://waimaie.meituan.com'
  ],
  5: [ // 饿百零售
    'https://nr.ele.me',
    'https://melody.shop.ele.me',
    'https://ele.me'
  ],
  6: [ // 京东到家
    'https://store.jddj.com',
    'https://order.jddj.com',
    'https://sff.jddj.com',
    'https://trade.m.jd.com',
    'https://trade.jd.com',
    'https://api.m.jd.com',
    'https://passport.jd.com',
    'https://sso.jd.com'
  ],
  7: ['https://jsls.jinritemai.com'], // 抖音即时零售
  1000: [ // 美团团购
    'https://ecom.meituan.com',
    'https://meituan.com',       // .meituan.com 域名（规范化后对所有美团子域名生效）
    'https://dianping.com',      // .dianping.com 域名（美团/大众点评共享 Cookie）
    'https://e.dianping.com'     // e.dianping.com 子域名
  ],
  1001: ['https://store.jddj.com'] // 京东团购（暂用京东到家域名）
}

// 设置店铺 cookies
const setShopCookies = async (shop: Shop) => {
  if (!(globalThis as any).electron) return

  const electron = (globalThis as any).electron
  const partition = `persist:webview_${shop.id}`

  try {
    // 先清空该 partition 下的所有 cookies
    await electron.clearCookies(partition, '*')

    // 获取该平台需要设置 cookies 的域名列表
    const domains = platformCookieDomains[shop.shop_type]
    if (domains) {
      // 批量设置 cookies 到所有相关域名
      await Promise.all(
        domains.map(domain => electron.setCookies(partition, shop.cookies, domain))
      )
    }
  } catch (error) {
    logger.error(`设置 cookies 失败 (店铺ID: ${shop.id}, 平台: ${shop.shop_type})`, error)
    throw error // 重新抛出错误，让调用者知道失败
  }
}

// 移除标签
const removeTab = (targetName: string | number) => {
  const targetId = String(targetName)
  const shopToRemove = shops.value.find(s => s.id === targetId)
  if (!shopToRemove) return

  // 从店铺列表中移除
  shops.value = shops.value.filter(shop => shop.id !== targetId)
  initializedWebviews.delete(targetId)

  // 如果移除的是当前激活的标签，需要切换到其他标签
  if (activeTab.value === targetId) {
    // 优先切换到同平台的其他店铺
    const samePlatformShops = shops.value.filter(s => s.shop_type === shopToRemove.shop_type)
    if (samePlatformShops.length > 0) {
      activeTab.value = samePlatformShops[0].id
    } else {
      // 如果该平台没有其他店铺了，切换到第一个有店铺的平台
      if (shops.value.length > 0) {
        selectedPlatform.value = shops.value[0].shop_type
        activeTab.value = shops.value[0].id
      } else {
        // 所有店铺都关闭了，保留多开页面，显示空状态
        activeTab.value = ''
        // 可以选择重置平台选择，或者保持当前选择
        // selectedPlatform.value = null
      }
    }
  }

  // 如果当前平台没有店铺了，切换到"全部"
  const currentPlatformHasShops = selectedPlatform.value === -1 || shops.value.some(s => s.shop_type === selectedPlatform.value)
  if (!currentPlatformHasShops && shops.value.length > 0) {
    selectedPlatform.value = -1
    activeTab.value = shops.value[0].id
  }
}

// 切换标签
const handleTabClick = () => {
  // 保存当前平台的激活标签
  if (selectedPlatform.value !== null && activeTab.value) {
    platformLastActiveTab.value[selectedPlatform.value] = activeTab.value
  }
}

// 设置 webview 音频状态
const setupWebviewAudio = (shopId: string, muted: boolean) => {
  const webviewElement = document.getElementById(`webview${shopId}`) as any
  if (webviewElement) {
    // 检查 webview 是否已加载
    const setAudio = () => {
      try {
        if (webviewElement.setAudioMuted && typeof webviewElement.setAudioMuted === 'function') {
          webviewElement.setAudioMuted(muted)
        }
      } catch (error) {
        logger.error(`设置 webview ${shopId} 静音失败`, error)
      }
    }

    // 立即尝试设置
    setAudio()

    // 监听 dom-ready 事件，确保在 webview 加载后也设置
    const onDomReady = () => {
      webviewElement.removeEventListener('dom-ready', onDomReady)
      setAudio()
    }
    webviewElement.addEventListener('dom-ready', onDomReady)
  }
}

// 切换静音
const toggleMute = (shopId: string) => {
  const shop = shops.value.find(s => s.id === shopId)
  if (shop) {
    shop.muted = !shop.muted

    // 设置 webview 静音
    nextTick(() => {
      setupWebviewAudio(shopId, shop.muted)
    })
  }
}

// 关闭窗口
const handleClose = () => {
  if ((globalThis as any).electron?.closeCurrentWindow) {
    (globalThis as any).electron.closeCurrentWindow()
  } else {
    window.close()
  }
}

/**
 * 打开店铺独立后台页面
 * 复用 openShopWindow 工具函数，但强制使用独立窗口方式（不使用多开管理器）
 */
const openShopInIndependentWindow = async (shopInfo: any) => {
  try {
    if (!shopInfo || !shopInfo.id) {
      logger.warn('打开独立页面失败: 店铺信息无效', shopInfo)
      gp.$baseMessage('打开独立页面失败: 店铺信息无效', 'error', 'hey')
      return
    }

    // 通过后端接口获取最新 cookies
    shopInfo.cookies = await apiManager.shopmgApi.GetShopCk(String(shopInfo.id))

    const electronApi = (globalThis as any).electron
    if (!electronApi?.openWin) {
      gp.$baseMessage('当前环境不支持打开独立窗口', 'error', 'hey')
      return
    }

    // 检查是否为饿了么复制版（shop_type = 8），该类型不支持打开后台
    if (shopInfo.shop_type === 8) {
      gp.$baseMessage('饿了么复制版不支持打开后台，请使用饿了么餐饮绑定店铺', 'warning', 'hey')
      return
    }

    // 移除 cookies 首尾的引号
    const removeStartEnd = (str: any) => {
      if (str && str.length > 0) {
        if (str.charAt(0) == '"') {
          str = str.substring(1)
        }
        if (str.at(-1) == '"') {
          str = str.substring(0, str.length - 1)
        }
      }
      return str
    }
    shopInfo.cookies = removeStartEnd(shopInfo.cookies)

    // 店铺类型到后台URL的映射
    const shopUrlMap: Record<number, string> = {
      1: 'https://e.waimai.meituan.com', // 美团外卖
      2: `https://melody.shop.ele.me/app/shop/${shopInfo.office_id}/dashboard#app.shop.dashboard`, // 饿了么外卖
      3: 'https://shangoue.meituan.com', // 美团闪购
      4: 'https://yiyao.meituan.com/main/frame', // 美团医药
      5: 'https://nr.ele.me', // 饿百零售
      6: 'https://store.jddj.com', // 京东到家
      7: 'https://jsls.jinritemai.com' // 抖店即时零售
    }

    const url = shopUrlMap[shopInfo.shop_type]
    if (!url) {
      gp.$baseMessage(`不支持的店铺类型: ${shopInfo.shop_type}`, 'error', 'hey')
      return
    }

    // 饿百零售需要特殊处理 cookies
    let cookieData: string | undefined = undefined
    if (shopInfo.shop_type === 5) {
      const parseCookie = (cookie: string) => {
        const map = new Map<string, string>()
        for (const item of cookie.split(/\s*;\s*/)) {
          if (item.length === 0) continue
          const [key, value] = <(string | undefined)[]>item.split(/\s*=\s*/)
          if (key === undefined || value === undefined || key.length === 0) continue
          map.set(decodeURIComponent(key), decodeURIComponent(value))
        }
        return map
      }

      const cookieArray: Array<{ url: string; name: string; value: string; domain: string }> = []
      const jar = parseCookie(shopInfo.cookies)
      for (const [key, value] of jar) {
        if (key === 'cna') continue
        cookieArray.push({
          url: 'https://nr.ele.me',
          name: encodeURIComponent(key),
          value: encodeURIComponent(value),
          domain: '.ele.me'
        })
      }
      cookieData = JSON.stringify(cookieArray)
    }

    // 打开独立窗口
    electronApi.openWin(url, shopInfo.office_id, shopInfo.cookies, shopInfo.name, cookieData, shopInfo.shop_type)
    gp.$baseMessage('已在新窗口中打开店铺后台', 'success', 'hey')
  } catch (error: any) {
    logger.error('打开独立后台页面失败:', error)
    gp.$baseMessage('打开独立后台页面失败: ' + (error.message || '未知错误'), 'error', 'hey')
  }
}

// 打开当前激活的 webview 的开发者工具
const openActiveWebviewDevTools = () => {
  if (!activeTab.value) {
    logger.warn('没有激活的标签页')
    return
  }

  const webviewElement = document.getElementById(`webview${activeTab.value}`) as any

  if (webviewElement) {
    try {
      if (typeof webviewElement.openDevTools === 'function') {
        webviewElement.openDevTools()
        logger.info(`已打开店铺 ${activeTab.value} 的开发者工具`)
      } else {
        logger.warn('openDevTools 方法不可用')
      }
    } catch (error) {
      logger.error(`打开 webview 开发者工具失败`, error)
    }
  } else {
    logger.warn('未找到 webview 元素')
  }
}

// 设置 webview 的右键菜单
const setupWebviewContextMenu = (shopId: string) => {
  const webviewElement = document.getElementById(`webview${shopId}`) as any
  if (!webviewElement) {
    logger.warn(`未找到 webview 元素: ${shopId}`)
    return
  }

  const electronApi = (globalThis as any).electron
  if (!electronApi?.ipcRenderer) {
    logger.warn('Electron API 不可用')
    return
  }

  // 监听 dom-ready 事件，注入脚本启用右键复制和文本选择
  webviewElement.addEventListener('dom-ready', () => {
    webviewElement.executeJavaScript(`
      (function() {
        // 移除禁止选择的 CSS
        const style = document.createElement('style');
        style.textContent = '* { -webkit-user-select: text !important; user-select: text !important; }';
        document.head.appendChild(style);
        // 移除右键菜单禁用
        document.oncontextmenu = null;
        document.body.oncontextmenu = null;
        // 移除选择禁用事件
        document.onselectstart = null;
        document.body.onselectstart = null;
        // 移除复制禁用
        document.oncopy = null;
        document.body.oncopy = null;
      })();
    `)
  })

  // 监听 webview 的 context-menu 事件
  webviewElement.addEventListener('context-menu', (e: any) => {
    e.preventDefault()
    const params = e.params

    // 获取当前店铺信息
    const currentShop = shops.value.find(s => s.id === shopId)
    if (!currentShop) {
      logger.warn(`未找到店铺信息: ${shopId}`)
      return
    }

    // 获取快捷入口
    const shortcuts = getShortcutUrls(currentShop)

    // 准备店铺信息
    const shopInfo = {
      id: currentShop.id,
      name: currentShop.name,
      office_id: currentShop.office_id,
      shop_type: currentShop.shop_type,
      cookies: currentShop.cookies || ''
    }

    // 发送右键菜单事件到主进程
    electronApi.ipcRenderer.send('show-context-menu', {
      x: params.x,
      y: params.y,
      selectionText: params.selectionText,
      isEditable: params.isEditable,
      linkURL: params.linkURL,
      srcURL: params.srcURL,
      webContentsId: webviewElement.getWebContentsId(),
      shopId: shopId,
      shortcuts: shortcuts,
      shopInfo: shopInfo
    })
  })

  logger.info(`已为店铺 ${shopId} 设置右键菜单`)
}

// 扁平化分组数据
const flattenGroups = (groups: any[], parentPath: string = ''): any[] => {
  const result: any[] = []
  groups.forEach((group: any) => {
    const groupId = group.Member?.id || group.id
    const groupName = group.Member?.name || group.name
    const currentPath = parentPath ? `${parentPath} / ${groupName}` : groupName

    if (groupId && groupName) {
      result.push({
        id: groupId,
        name: groupName,
        fullPath: currentPath,
        shopCount: 0 // 初始化为0，后续通过API获取
      })
    }

    if (group.children && group.children.length > 0) {
      result.push(...flattenGroups(group.children, currentPath))
    }
  })
  return result
}

// 获取分组列表
const fetchGroupList = async () => {
  try {
    groupListLoading.value = true
    const res: any = await getGroup({
      grouptype: 1, // 店铺分组类型
      recursionchild: true // 递归获取子分组
    })

    if (res.code === 200 && res.data) {
      groupList.value = res.data
      flatGroupList.value = flattenGroups(res.data)

      // 为每个分组获取店铺数量
      await Promise.all(flatGroupList.value.map(async (group) => {
        try {
          const shopRes: any = await getBindShopList({
            groupid: group.id,
            page: 1,
            pageSize: 1 // 只需要获取总数
          })
          if (shopRes.code === 200 && shopRes.data) {
            group.shopCount = shopRes.data.total || 0
          }
        } catch (error) {
          logger.error(`获取分组 ${group.name} 店铺数量失败`, error)
        }
      }))
    }
  } catch (error) {
    logger.error('获取分组列表失败', error)
  } finally {
    groupListLoading.value = false
  }
}

// 刷新分组列表
const refreshGroupList = () => {
  fetchGroupList()
  if (selectedGroupId.value) {
    // 如果已选择分组，重新加载店铺列表
    fetchShopList(selectedGroupId.value)
  }
}

// 打开分组管理对话框
const openGroupManager = async () => {
  groupManagerVisible.value = true
  if (flatGroupList.value.length === 0) {
    await fetchGroupList()
  }
}

// 选择分组
const selectGroup = async (group: any) => {
  selectedGroupId.value = group.id
  selectedGroupName.value = group.name
  await fetchShopList(group.id)
}

// 获取分组下的店铺列表
const fetchShopList = async (groupId: string) => {
  try {
    shopListLoading.value = true
    const res: any = await getBindShopList({
      groupid: groupId,
      page: 1,
      pageSize: 1000 // 获取所有店铺
    })

    if (res.code === 200 && res.data) {
      selectedShops.value = res.data.rows || []
    } else {
      selectedShops.value = []
    }
  } catch (error) {
    logger.error('获取分组店铺列表失败', error)
    selectedShops.value = []
  } finally {
    shopListLoading.value = false
  }
}

// 处理 cookies 字符串（去除首尾引号）
const removeStartEnd = (str: any) => {
  if (str && str.length > 0) {
    if (str.charAt(0) == '"') {
      str = str.substring(1)
    }
    if (str.at(-1) == '"') {
      str = str.substring(0, str.length - 1)
    }
  }
  return str
}

// 打开单个店铺后台
const openShop = async (shop: any) => {
  try {
    // 检查是否为饿了么复制版（shop_type = 8），该类型不支持打开后台
    if (shop.shop_type === 8) {
      if ((globalThis as any).electron?.showMessageBox) {
        (globalThis as any).electron.showMessageBox({
          type: 'warning',
          title: '不支持的店铺类型',
          message: '饿了么复制版不支持打开后台，请使用饿了么餐饮绑定店铺'
        })
      }
      return
    }

    // 通过后端接口获取最新 cookies
    let cookies = await apiManager.shopmgApi.GetShopCk(String(shop.id))
    cookies = removeStartEnd(cookies)

    // 构建店铺数据
    const shopData: Shop = {
      id: shop.id,
      name: shop.name,
      office_id: shop.office_id,
      shop_type: shop.shop_type,
      cookies: cookies,
      muted: true
    }

    // 添加到当前窗口
    await addShop(shopData)

    // 关闭对话框
    groupManagerVisible.value = false
  } catch (error) {
    logger.error(`打开店铺 ${shop.name} 失败`, error)
    if ((globalThis as any).electron?.showMessageBox) {
      (globalThis as any).electron.showMessageBox({
        type: 'error',
        title: '打开失败',
        message: `打开店铺 "${shop.name}" 失败，请稍后重试`
      })
    }
  }
}

// 打开所有店铺后台
const openAllShops = async () => {
  if (selectedShops.value.length === 0) return

  const total = selectedShops.value.length
  let successCount = 0
  let failCount = 0
  const failedShops: string[] = []

  // 过滤掉不支持打开后台的店铺类型（如饿了么复制版）
  const validShops = selectedShops.value.filter(shop => shop.shop_type !== 8)
  const skippedCount = total - validShops.length

  // 批量打开，但限制并发数量，避免一次性打开太多
  const batchSize = 5
  for (let i = 0; i < validShops.length; i += batchSize) {
    const batch = validShops.slice(i, i + batchSize)

    await Promise.allSettled(
      batch.map(async (shop) => {
        try {
          // 通过后端接口获取最新 cookies
          let cookies = await apiManager.shopmgApi.GetShopCk(String(shop.id))
          cookies = removeStartEnd(cookies)

          const shopData: Shop = {
            id: shop.id,
            name: shop.name,
            office_id: shop.office_id,
            shop_type: shop.shop_type,
            cookies: cookies,
            muted: true
          }
          await addShop(shopData)
          successCount++
        } catch (error) {
          logger.error(`打开店铺 ${shop.name} 失败`, error)
          failCount++
          failedShops.push(shop.name)
        }
      })
    )

    // 每批之间稍作延迟，避免请求过快
    if (i + batchSize < validShops.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // 关闭对话框
  groupManagerVisible.value = false

  // 显示结果提示
  if ((globalThis as any).electron?.showMessageBox) {
    let message = ''
    if (failCount === 0 && skippedCount === 0) {
      message = `成功打开 ${successCount} 个店铺后台`
    } else {
      const parts: string[] = []
      if (successCount > 0) {
        parts.push(`成功打开 ${successCount} 个`)
      }
      if (failCount > 0) {
        parts.push(`${failCount} 个失败`)
      }
      if (skippedCount > 0) {
        parts.push(`${skippedCount} 个不支持打开后台`)
      }
      message = parts.join('，')
    }

    ; (globalThis as any).electron.showMessageBox({
      type: failCount === 0 && skippedCount === 0 ? 'info' : 'warning',
      title: '批量打开完成',
      message
    })
  }
}

// 初始化标签拖拽排序
let sortableInstance: Sortable | null = null
const initTabsDrag = () => {
  nextTick(() => {
    const tabsNav = document.querySelector('.shop-backend-manager .el-tabs__nav') as HTMLElement
    if (!tabsNav) return

    // 如果已存在实例，先销毁
    if (sortableInstance) {
      try {
        sortableInstance.destroy()
        sortableInstance = null
      } catch (error) {
        // 忽略销毁错误
      }
    }

    // 初始化 Sortable
    try {
      sortableInstance = new Sortable(tabsNav, {
        animation: 150,
        draggable: '.el-tabs__item',
        // 不使用 handle，让整个标签都可以拖拽
        ghostClass: 'tab-ghost',
        chosenClass: 'tab-chosen',
        dragClass: 'tab-drag',
        forceFallback: false,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onStart: (evt) => {
          const item = evt.item as HTMLElement
          const tabLabel = item.querySelector('.tab-label')
          const eventTarget = (evt as any).originalEvent?.target as HTMLElement
          if (tabLabel && eventTarget?.closest('.tab-label')) {
            sortableInstance?.option('disabled', true)
            return false
          } else if (sortableInstance) {
            sortableInstance.option('disabled', false)
          }
        },
        onMove: (evt) => {
          const related = evt.related as HTMLElement
          if (related && related.closest('.temp-groups-section')) {
            return false
          }
          return true
        },
        onEnd: (evt) => {
          if (sortableInstance) {
            sortableInstance.option('disabled', false)
          }

          const { oldIndex, newIndex } = evt
          if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
            return
          }

          // 获取当前显示的店铺列表的副本
          const currentShops = [...currentPlatformShops.value]
          const movedShop = currentShops[oldIndex]

          // 重新排序当前平台的店铺
          const [removed] = currentShops.splice(oldIndex, 1)
          currentShops.splice(newIndex, 0, removed)

          // 更新全局 shops 数组
          if (selectedPlatform.value === -1) {
            // 如果是"全部"视图，直接使用重新排序的结果
            shops.value = currentShops
          } else {
            // 如果是特定平台，保持其他平台店铺的位置不变
            const otherShops = shops.value.filter(s => s.shop_type !== selectedPlatform.value)
            shops.value = [...otherShops, ...currentShops]
          }
        }
      })
    } catch (error) {
      logger.error('初始化标签拖拽失败', error)
    }
  })
}

// 初始化左侧平台列表拖拽排序
let platformSortableInstance: Sortable | null = null
const initPlatformDrag = () => {
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    const platformList = document.querySelector('.shop-backend-manager .platform-list') as HTMLElement
    if (!platformList) return

    // 如果已存在实例，先销毁
    if (platformSortableInstance) {
      try {
        platformSortableInstance.destroy()
        platformSortableInstance = null
      } catch (error) {
        // 忽略销毁错误
      }
    }

    // 初始化 Sortable
    try {
      platformSortableInstance = new Sortable(platformList, {
        animation: 150,
        // 拖拽 el-tooltip 元素，但排除包含 all-platform 的 tooltip
        filter: (evt, target) => {
          // 如果是"全部"按钮（第一个元素），不允许拖拽
          const tooltipElement = target.closest('.platform-list')?.children[0]
          return target === tooltipElement
        },
        ghostClass: 'platform-ghost',
        chosenClass: 'platform-chosen',
        dragClass: 'platform-drag',
        forceFallback: false, // 使用原生 HTML5 拖拽
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onStart: (evt) => {
          isDraggingPlatform = true
          // 如果是第一个元素（全部按钮），取消拖拽
          if (evt.oldIndex === 0) {
            return false
          }
        },
        onEnd: (evt) => {
          // 延迟重置拖拽标记，确保 watch 不会在拖拽结束时立即触发
          setTimeout(() => {
            isDraggingPlatform = false
          }, 300)
          try {
            let { oldIndex, newIndex } = evt

            if (oldIndex === undefined || newIndex === undefined) {
              return
            }

            // 关键修复：由于"全部"按钮（el-tooltip）占据 DOM 索引 0
            // 需要将 DOM 索引转换为数据索引：DOM 索引 - 1 = 数据索引
            const dataOldIndex = oldIndex - 1
            const dataNewIndex = newIndex - 1

            // 如果转换后位置没变，直接返回
            if (dataOldIndex === dataNewIndex) {
              return
            }

            // 获取当前平台列表的副本（不直接修改 computed 属性）
            const currentPlatforms = [...platforms.value]

            // 检查转换后的索引是否有效
            if (dataOldIndex < 0 || dataOldIndex >= currentPlatforms.length ||
              dataNewIndex < 0 || dataNewIndex >= currentPlatforms.length) {
              return
            }

            // 重新排序
            const [movedPlatform] = currentPlatforms.splice(dataOldIndex, 1)

            // 确保 movedPlatform 存在
            if (!movedPlatform) {
              return
            }

            currentPlatforms.splice(dataNewIndex, 0, movedPlatform)

            // 保存新的排序顺序
            platformOrder.value = currentPlatforms.map(p => p.type)
          } catch (error) {
            logger.error('平台拖拽处理失败', error)
          }
        }
      })
    } catch (error) {
      logger.error('初始化平台拖拽失败', error)
    }
  })
}

// 监听当前平台店铺列表变化，重新初始化拖拽
watch(() => currentPlatformShops.value.length, () => {
  // 延迟初始化，确保 DOM 已更新
  setTimeout(() => {
    initTabsDrag()
  }, 100)
})

// 监听平台列表的实际变化（新增或删除平台）
let lastPlatformTypes = new Set<number>()
let isDraggingPlatform = false // 标记是否正在拖拽平台

watch(() => platforms.value, (newPlatforms) => {
  // 如果正在拖拽，跳过处理，避免干扰
  if (isDraggingPlatform) {
    return
  }

  // 获取当前的平台类型集合
  const currentTypes = new Set(newPlatforms.map(p => p.type))

  // 检查是否有新增或删除的平台（不是排序变化）
  const hasNewPlatform = newPlatforms.some(p => !lastPlatformTypes.has(p.type))
  const hasRemovedPlatform = Array.from(lastPlatformTypes).some(t => !currentTypes.has(t))

  if (hasNewPlatform || hasRemovedPlatform) {
    // 有新增或删除，需要重新初始化拖拽
    lastPlatformTypes = currentTypes
    setTimeout(() => {
      initPlatformDrag()
    }, 100)
  } else {
    // 只是排序变化，更新缓存即可
    lastPlatformTypes = currentTypes
  }
}, { deep: true })

// 初始化临时分组拖拽排序
let tempGroupsSortableInstance: Sortable | null = null
let isDraggingTempGroup = false // 标记是否正在拖拽临时分组

const initTempGroupsDrag = () => {
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    const tempGroupsList = document.querySelector('.shop-backend-manager .temp-groups-list') as HTMLElement
    if (!tempGroupsList) return

    // 如果已存在实例，先销毁
    if (tempGroupsSortableInstance) {
      try {
        tempGroupsSortableInstance.destroy()
        tempGroupsSortableInstance = null
      } catch (error) {
        // 忽略销毁错误
      }
    }

    // 初始化 Sortable
    try {
      tempGroupsSortableInstance = new Sortable(tempGroupsList, {
        animation: 150,
        draggable: '.temp-group-item',
        // 排除输入框，不允许拖拽
        filter: (evt, target) => {
          // 如果是输入框区域，不允许拖拽
          const inputWrapper = target.closest('.temp-groups-add-input--inlist')
          return !!inputWrapper
        },
        ghostClass: 'temp-group-ghost',
        chosenClass: 'temp-group-chosen',
        dragClass: 'temp-group-drag',
        forceFallback: false,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        onStart: (evt) => {
          isDraggingTempGroup = true
          // 如果是输入框，取消拖拽
          const inputWrapper = (evt.item as HTMLElement).closest('.temp-groups-add-input--inlist')
          if (inputWrapper) {
            return false
          }
        },
        onEnd: (evt) => {
          // 延迟重置拖拽标记
          setTimeout(() => {
            isDraggingTempGroup = false
          }, 300)
          try {
            let { oldIndex, newIndex } = evt

            if (oldIndex === undefined || newIndex === undefined) {
              return
            }

            // 关键：由于输入框（.temp-groups-add-input--inlist）占据 DOM 索引 0
            // 需要将 DOM 索引转换为数据索引：DOM 索引 - 1 = 数据索引
            const dataOldIndex = oldIndex - 1
            const dataNewIndex = newIndex - 1

            // 如果转换后位置没变，直接返回
            if (dataOldIndex === dataNewIndex) {
              return
            }

            // 获取当前临时分组列表的副本
            const currentGroups = [...tempGroups.value]

            // 检查转换后的索引是否有效
            if (dataOldIndex < 0 || dataOldIndex >= currentGroups.length ||
              dataNewIndex < 0 || dataNewIndex >= currentGroups.length) {
              return
            }

            // 重新排序
            const [movedGroup] = currentGroups.splice(dataOldIndex, 1)

            // 确保 movedGroup 存在
            if (!movedGroup) {
              return
            }

            currentGroups.splice(dataNewIndex, 0, movedGroup)

            // 更新临时分组数组
            tempGroups.value = currentGroups
            // 保存到 localStorage
            saveTempGroups()
          } catch (error) {
            logger.error('临时分组拖拽处理失败', error)
          }
        }
      })
    } catch (error) {
      logger.error('初始化临时分组拖拽失败', error)
    }
  })
}

// 监听临时分组列表的变化（新增或删除分组）
let lastTempGroupIds = new Set<string>()

watch(() => tempGroups.value, (newGroups) => {
  // 如果正在拖拽，跳过处理，避免干扰
  if (isDraggingTempGroup) {
    return
  }

  // 获取当前的分组ID集合
  const currentIds = new Set(newGroups.map(g => g.id))

  // 检查是否有新增或删除的分组（不是排序变化）
  const hasNewGroup = newGroups.some(g => !lastTempGroupIds.has(g.id))
  const hasRemovedGroup = Array.from(lastTempGroupIds).some(id => !currentIds.has(id))

  if (hasNewGroup || hasRemovedGroup) {
    // 有新增或删除，需要重新初始化拖拽
    lastTempGroupIds = currentIds
    setTimeout(() => {
      initTempGroupsDrag()
    }, 100)
  } else {
    // 只是排序变化，更新缓存即可
    lastTempGroupIds = currentIds
  }
}, { deep: true })

// 临时分组相关
interface TempGroup {
  id: string
  name: string
  createTime: number
}

interface TempGroupShop {
  groupId: string
  shopId: string
  // 保存店铺基本信息，即使标签关闭也能显示和重新打开
  shopName?: string
  officeId?: string
  shopType?: number
}

const tempGroups = ref<TempGroup[]>([])
const addTempGroupDialogVisible = ref(false)
const editTempGroupDialogVisible = ref(false)
const viewTempGroupDialogVisible = ref(false)
const tempGroupForm = ref({ id: '', name: '' })
const selectedTempGroupShops = ref<Shop[]>([])
const dragOverGroupId = ref<string | null>(null)
const draggingShopId = ref<string | null>(null)
const newTempGroupName = ref('')
const editingTempGroupId = ref<string | null>(null)
const editingTempGroupName = ref('')
const editingTempGroupOriginalName = ref('')
const tempGroupsSectionRef = ref<HTMLElement | null>(null)
const ignoreNextOutsideClick = ref(false)

// 临时分组数据持久化
const TEMP_GROUPS_STORAGE_KEY = 'shop_backend_temp_groups'
const TEMP_GROUP_SHOPS_STORAGE_KEY = 'shop_backend_temp_group_shops'

// 加载临时分组数据
const loadTempGroups = () => {
  try {
    const groupsStr = localStorage.getItem(TEMP_GROUPS_STORAGE_KEY)
    const shopsStr = localStorage.getItem(TEMP_GROUP_SHOPS_STORAGE_KEY)
    if (groupsStr) {
      tempGroups.value = JSON.parse(groupsStr)
    }
    if (shopsStr) {
      tempGroupShops.value = JSON.parse(shopsStr)
    }
  } catch (error) {
    logger.error('加载临时分组数据失败', error)
  }
}

// 保存临时分组数据
const saveTempGroups = () => {
  try {
    localStorage.setItem(TEMP_GROUPS_STORAGE_KEY, JSON.stringify(tempGroups.value))
    localStorage.setItem(TEMP_GROUP_SHOPS_STORAGE_KEY, JSON.stringify(tempGroupShops.value))
  } catch (error) {
    logger.error('保存临时分组数据失败', error)
  }
}

// 页面关闭时：仅清空“分组-店铺归属”，保留分组列表
const resetTempGroupShopsOnClose = () => {
  try {
    tempGroupShops.value = []
    localStorage.setItem(TEMP_GROUP_SHOPS_STORAGE_KEY, JSON.stringify([]))
  } catch (error) {
    logger.error('关闭时重置临时分组店铺失败', error)
  }
}

// 显示添加临时分组对话框
const showAddTempGroupDialog = () => {
  tempGroupForm.value = { id: '', name: '' }
  addTempGroupDialogVisible.value = true
}

// 快速添加临时分组（通过输入框）
const quickAddTempGroup = () => {
  if (!newTempGroupName.value || !newTempGroupName.value.trim()) {
    return
  }
  const newGroup: TempGroup = {
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newTempGroupName.value.trim(),
    createTime: Date.now()
  }
  tempGroups.value.push(newGroup)
  saveTempGroups()
  newTempGroupName.value = ''
}

// 保存临时分组（对话框方式，保留用于编辑）
const saveTempGroup = () => {
  if (!tempGroupForm.value.name || !tempGroupForm.value.name.trim()) {
    return
  }
  const newGroup: TempGroup = {
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: tempGroupForm.value.name.trim(),
    createTime: Date.now()
  }
  tempGroups.value.push(newGroup)
  saveTempGroups()
  addTempGroupDialogVisible.value = false
  tempGroupForm.value = { id: '', name: '' }
}

// 编辑临时分组
const editTempGroup = (group: TempGroup) => {
  // 行内编辑：点击编辑按钮直接改名，不弹窗
  editingTempGroupId.value = group.id
  editingTempGroupName.value = group.name
  editingTempGroupOriginalName.value = group.name
  // 避免“点击编辑按钮”这一次触发全局 outside-click 立刻取消
  ignoreNextOutsideClick.value = true
}

// 更新临时分组
const updateTempGroup = () => {
  if (!tempGroupForm.value.name || !tempGroupForm.value.name.trim()) {
    return
  }
  const index = tempGroups.value.findIndex(g => g.id === tempGroupForm.value.id)
  if (index !== -1) {
    tempGroups.value[index].name = tempGroupForm.value.name.trim()
    saveTempGroups()
  }
  editTempGroupDialogVisible.value = false
  tempGroupForm.value = { id: '', name: '' }
}

// 行内保存分组名
const saveInlineTempGroupName = () => {
  if (!editingTempGroupId.value) return
  const newName = (editingTempGroupName.value || '').trim()
  const oldName = (editingTempGroupOriginalName.value || '').trim()
  if (!newName) {
    // 空值视为取消
    cancelInlineTempGroupName()
    return
  }
  // 未改动：直接退出编辑（不触发保存/持久化）
  if (newName === oldName) {
    cancelInlineTempGroupName()
    return
  }
  const index = tempGroups.value.findIndex(g => g.id === editingTempGroupId.value)
  if (index !== -1) {
    tempGroups.value[index].name = newName
    saveTempGroups()
    // 如果当前正在查看该分组，也同步标题
    if (selectedTempGroupId.value === editingTempGroupId.value) {
      selectedTempGroupName.value = newName
    }
  }
  editingTempGroupId.value = null
  editingTempGroupName.value = ''
  editingTempGroupOriginalName.value = ''
}

// 行内取消编辑
const cancelInlineTempGroupName = () => {
  editingTempGroupId.value = null
  editingTempGroupName.value = ''
  editingTempGroupOriginalName.value = ''
}

// 行内编辑：点击输入框外时（即使没有聚焦输入框）也退出编辑
const handleTempGroupOutsideClick = (e: MouseEvent) => {
  if (!editingTempGroupId.value) return
  if (ignoreNextOutsideClick.value) {
    ignoreNextOutsideClick.value = false
    return
  }
  const root = tempGroupsSectionRef.value
  if (!root) return
  const editWrapper = root.querySelector('.temp-group-edit-wrapper')
  if (editWrapper && editWrapper.contains(e.target as Node)) return

  // 默认行为：未改名则取消；改名则保存（与 blur 行为一致）
  const newName = (editingTempGroupName.value || '').trim()
  const oldName = (editingTempGroupOriginalName.value || '').trim()
  if (!newName || newName === oldName) {
    cancelInlineTempGroupName()
  } else {
    saveInlineTempGroupName()
  }
}

// 删除临时分组
const deleteTempGroup = (groupId: string) => {
  const count = getTempGroupShopCount(groupId)
  // 有店铺：提示确认；无店铺：直接删除
  if (count > 0) {
    ElMessageBox.confirm(`该分组内有 ${count} 个店铺，确定要删除分组吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      tempGroups.value = tempGroups.value.filter(g => g.id !== groupId)
      tempGroupShops.value = tempGroupShops.value.filter(s => s.groupId !== groupId)
      saveTempGroups()
    }).catch(() => { })
    return
  }
  tempGroups.value = tempGroups.value.filter(g => g.id !== groupId)
  tempGroupShops.value = tempGroupShops.value.filter(s => s.groupId !== groupId)
  saveTempGroups()
}

// 获取临时分组内的店铺数量
const getTempGroupShopCount = (groupId: string): number => {
  return tempGroupShops.value.filter(s => s.groupId === groupId).length
}

// 标签拖拽开始
const handleTabDragStart = (event: DragEvent, shopId: string) => {
  draggingShopId.value = shopId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', shopId)
    event.dataTransfer.setData('application/json', JSON.stringify({ shopId }))
  }
  if (sortableInstance) {
    sortableInstance.option('disabled', true)
  }
}

// 标签拖拽结束
const handleTabDragEnd = (event?: DragEvent) => {
  if (sortableInstance) {
    sortableInstance.option('disabled', false)
  }
  setTimeout(() => {
    draggingShopId.value = null
    dragOverGroupId.value = null
  }, 100)
  if (event) {
    event.stopPropagation()
  }
}

// 拖拽到临时分组上方
const handleDragOver = (event: DragEvent, groupId: string) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverGroupId.value = groupId
}

// 拖拽离开
const handleDragLeave = () => {
  dragOverGroupId.value = null
}

// 拖拽放置到临时分组
const handleDropToTempGroup = (event: DragEvent, groupId: string) => {
  event.preventDefault()
  event.stopPropagation()
  dragOverGroupId.value = null

  let shopId = draggingShopId.value
  if (!shopId && event.dataTransfer) {
    const data = event.dataTransfer.getData('text/plain')
    if (data) {
      shopId = data
    } else {
      try {
        const jsonData = event.dataTransfer.getData('application/json')
        if (jsonData) {
          const parsed = JSON.parse(jsonData)
          shopId = parsed.shopId
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  }

  // 如果 shopId 是店铺名称，尝试通过名称查找店铺ID
  if (shopId && !shops.value.find(s => s.id === shopId)) {
    const shopByName = shops.value.find(s => s.name === shopId)
    if (shopByName) {
      shopId = shopByName.id
    }
  }

  if (!shopId) {
    return
  }

  const shop = shops.value.find(s => s.id === shopId)

  if (!shop) {
    return
  }

  // 检查是否已在其他分组中
  const existingIndex = tempGroupShops.value.findIndex(s => s.shopId === shopId)
  if (existingIndex !== -1) {
    // 如果已在其他分组，先移除
    tempGroupShops.value.splice(existingIndex, 1)
  }

  // 添加到当前分组，保存店铺基本信息
  const existingShopInGroup = tempGroupShops.value.find(s => s.shopId === shopId && s.groupId === groupId)
  if (!existingShopInGroup) {
    tempGroupShops.value.push({
      groupId: groupId,
      shopId: shopId,
      shopName: shop.name,
      officeId: shop.office_id,
      shopType: shop.shop_type
    })
  }

  saveTempGroups()
  draggingShopId.value = null
}

// 查看临时分组内的店铺 - 直接打开所有店铺后台
const viewTempGroupShops = async (group: TempGroup) => {
  const groupShops = tempGroupShops.value.filter(s => s.groupId === group.id)

  if (groupShops.length === 0) {
    if ((globalThis as any).electron?.showMessageBox) {
      (globalThis as any).electron.showMessageBox({
        type: 'info',
        title: '提示',
        message: '该临时分组内暂无店铺'
      })
    }
    return
  }

  // 设置选中的临时分组（在打开店铺之前设置，这样 currentPlatformShops 会自动过滤只显示该分组内的店铺）
  selectedTempGroupId.value = group.id
  selectedTempGroupName.value = group.name
  // 清除平台选择状态，这样平台不会被选中显示背景色
  selectedPlatform.value = null

  // 批量打开分组内的所有店铺
  let successCount = 0
  let failCount = 0
  const failedShops: string[] = []
  const openedShopIds: string[] = []

  // 限制并发数量，避免一次性打开太多
  const batchSize = 3
  for (let i = 0; i < groupShops.length; i += batchSize) {
    const batch = groupShops.slice(i, i + batchSize)

    await Promise.allSettled(
      batch.map(async (tempShop) => {
        try {
          // 检查店铺是否已打开
          const existingShop = shops.value.find(s => s.id === tempShop.shopId)
          if (existingShop) {
            // 如果已打开，记录并跳过
            openedShopIds.push(tempShop.shopId)
            successCount++
            return
          }

          // 如果未打开，使用保存的店铺信息打开
          const shopData = {
            id: tempShop.shopId,
            name: tempShop.shopName || '未知店铺',
            office_id: tempShop.officeId || '',
            shop_type: tempShop.shopType || 1
          }

          await openShop(shopData)
          openedShopIds.push(tempShop.shopId)
          successCount++
        } catch (error) {
          logger.error(`打开店铺 ${tempShop.shopName || tempShop.shopId} 失败`, error)
          failCount++
          failedShops.push(tempShop.shopName || tempShop.shopId)
        }
      })
    )

    // 每批之间稍作延迟，避免请求过快
    if (i + batchSize < groupShops.length) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  // 打开完成后，激活第一个打开的店铺标签
  // 注意：由于设置了 selectedTempGroupId，currentPlatformShops 会自动过滤只显示该分组内的店铺
  if (openedShopIds.length > 0) {
    // 等待 shops 数组更新
    await nextTick()
    // 激活第一个打开的店铺标签
    activeTab.value = openedShopIds[0]
  }

  // 显示结果提示
  if ((globalThis as any).electron?.showMessageBox) {
    let message = ''
    if (failCount === 0) {
      message = `成功打开 ${successCount} 个店铺后台`
    } else {
      message = `成功打开 ${successCount} 个，${failCount} 个失败${failedShops.length > 0 ? `：${failedShops.join('、')}` : ''}`
    }

    ; (globalThis as any).electron.showMessageBox({
      type: failCount === 0 ? 'info' : 'warning',
      title: '批量打开完成',
      message
    })
  }
}

// 从临时分组打开店铺后台
const openShopFromTempGroup = async (shop: Shop) => {
  // 检查店铺是否已打开
  const existingShop = shops.value.find(s => s.id === shop.id)
  if (existingShop) {
    // 如果已打开，跳转到该店铺标签
    selectedPlatform.value = existingShop.shop_type
    activeTab.value = shop.id
    // 关闭对话框
    viewTempGroupDialogVisible.value = false
    return
  }

  // 如果未打开，使用保存的店铺信息重新打开
  // 构建店铺对象（只包含必要信息，openShop 会获取 cookies）
  const shopData = {
    id: shop.id,
    name: shop.name,
    office_id: shop.office_id,
    shop_type: shop.shop_type
  }
  await openShop(shopData)
  // 关闭对话框
  viewTempGroupDialogVisible.value = false
}

// 从临时分组移除店铺
const removeShopFromTempGroup = (shopId: string) => {
  const index = tempGroupShops.value.findIndex(s => s.shopId === shopId && s.groupId === selectedTempGroupId.value)
  if (index !== -1) {
    tempGroupShops.value.splice(index, 1)
    saveTempGroups()
    // 更新显示列表
    const groupShops = tempGroupShops.value.filter(s => s.groupId === selectedTempGroupId.value)
    selectedTempGroupShops.value = groupShops.map(tempShop => {
      const openedShop = shops.value.find(s => s.id === tempShop.shopId)
      if (openedShop) {
        return openedShop
      }
      return {
        id: tempShop.shopId,
        name: tempShop.shopName || '未知店铺',
        office_id: tempShop.officeId || '',
        shop_type: tempShop.shopType || 1,
        cookies: '',
        muted: true
      } as Shop
    })
  }
}

// 监听来自主窗口的消息
onMounted(async () => {
  // 加载临时分组数据
  loadTempGroups()
  // 新打开“店铺多开后台管理页面”时：临时分组内的店铺关系需要重置（分组保留）
  // 兜底：即使上次关闭窗口未触发 unmount，这里也会强制清空，避免店铺自动跑回分组、数量不归零
  resetTempGroupShopsOnClose()

  const electronApi = (globalThis as any).electron

  if (!electronApi) {
    logger.error('Electron API 不可用，无法初始化店铺后台管理器')
    return
  }

  // 监听后续打开店铺的事件
  if (electronApi.onOpenShop) {
    electronApi.onOpenShop((shopData: Shop) => addShop(shopData))
  }

  // 主动获取待打开的店铺数据（解决首次打开时序问题）
  if (electronApi.getPendingShopData) {
    try {
      const pendingShopData = await electronApi.getPendingShopData()
      if (pendingShopData) {
        addShop(pendingShopData)
      }
    } catch (error) {
      logger.error('获取待打开的店铺数据失败', error)
    }
  }

  // 监听 window postMessage（备用方案）
  window.addEventListener('message', (event) => {
    if (event.data.type === 'OPEN_SHOP') {
      addShop(event.data.shop)
    }
  })

  // 初始化标签拖拽功能
  initTabsDrag()

  // 初始化平台列表拖拽功能
  initPlatformDrag()

  // 初始化临时分组拖拽功能
  initTempGroupsDrag()

  // 监听主进程发来的打开 webview 开发者工具消息
  if (electronApi.ipcRenderer?.on) {
    electronApi.ipcRenderer.on('open-webview-devtools', () => {
      openActiveWebviewDevTools()
    })

    // 监听打开独立页面消息
    electronApi.ipcRenderer.on('open-shop-in-independent-window', async (event: any, shopInfo: any) => {
      await openShopInIndependentWindow(shopInfo)
    })

    // 监听快捷入口导航消息
    electronApi.ipcRenderer.on('navigate-to-url', (_event: any, data: { shopId: string; url: string }) => {
      const { shopId, url } = data
      const webviewElement = document.getElementById(`webview${shopId}`) as any
      if (webviewElement && typeof webviewElement.loadURL === 'function') {
        webviewElement.loadURL(url)
        logger.info(`导航到: ${url}`)
      }
    })
  }

  // 添加快捷键监听，用于打开 webview 的开发者工具
  // 使用 capture 模式确保事件能被捕获
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+Shift+I 打开当前激活的 webview 的开发者工具
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      e.stopPropagation()
      openActiveWebviewDevTools()
      return
    }
    // F12 也打开当前激活的 webview 的开发者工具
    if (e.key === 'F12') {
      e.preventDefault()
      e.stopPropagation()
      openActiveWebviewDevTools()
      return
    }
  }

  // 在捕获阶段监听，优先级更高
  document.addEventListener('keydown', handleKeyDown, true)
  // 同时在冒泡阶段也监听，作为备份
  window.addEventListener('keydown', handleKeyDown, false)

  // 行内编辑：捕获阶段监听点击，支持“未聚焦输入框也可点击外部取消/保存”
  document.addEventListener('mousedown', handleTempGroupOutsideClick, true)
  // 窗口关闭/刷新时也要清空分组内店铺关系
  window.addEventListener('beforeunload', resetTempGroupShopsOnClose)

  onBeforeUnmount(() => {
    // 关闭后台管理页面后：临时分组内店铺重置清空，但分组保留
    resetTempGroupShopsOnClose()
    document.removeEventListener('mousedown', handleTempGroupOutsideClick, true)
    document.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('keydown', handleKeyDown, false)
    window.removeEventListener('beforeunload', resetTempGroupShopsOnClose)

    // 清理拖拽实例
    if (tempGroupsSortableInstance) {
      try {
        tempGroupsSortableInstance.destroy()
        tempGroupsSortableInstance = null
      } catch (error) {
        // 忽略销毁错误
      }
    }
  })
})
</script>

<style scoped lang="scss">
.shop-backend-manager {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f5f5f5;

  // 左侧平台导航
  .platform-sidebar {
    width: 160px;
    background: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.3s ease;

    // 折叠状态
    &.collapsed {
      width: 64px;

      .sidebar-header {
        padding: 12px 8px;
        justify-content: center;

        h3 {
          display: none;
        }

        .collapse-btn {
          margin: 0 auto;
        }
      }

      .platform-item {
        justify-content: center;
        padding: 8px;

        .platform-icon {
          margin-right: 0; // 折叠时图标居中，无右边距
        }

        .platform-info {
          display: none;
        }
      }

      .sidebar-footer {
        padding: 12px 8px;

        .el-button {
          width: 100%;
          padding: 8px;
        }
      }
    }

    .sidebar-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;

      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        flex: 1;
      }

      .collapse-btn {
        width: 24px;
        height: 24px;
        padding: 0;
        flex-shrink: 0;
        transition: all 0.3s;

        &:hover {
          background-color: #ecf5ff;
          border-color: #409eff;
          color: #409eff;
        }
      }
    }

    .platform-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .platform-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 6px;
      border-radius: 6px;
      cursor: pointer; // 默认使用指针样式
      transition: all 0.3s;
      background: #f5f7fa;
      min-height: 44px; // 确保折叠时有足够高度

      &:hover {
        background: #e8f4ff;
      }

      // 拖拽时的样式
      &.platform-chosen {
        opacity: 0.6;
        transform: scale(1.02);
        cursor: grabbing !important; // 拖拽时使用抓取样式
      }

      &.platform-drag {
        cursor: grabbing !important; // 拖拽时使用抓取样式
      }

      &.platform-ghost {
        opacity: 0.3;
        background: #e8f4ff !important;
        border: 1px dashed #409eff !important;
      }

      &.platform-drag {
        opacity: 0.8;
        transform: rotate(1deg);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      // "全部"按钮不可拖拽
      &.all-platform {
        cursor: pointer; // 恢复为普通光标
      }

      &.active {
        background: #409eff;
        color: #fff;

        .platform-name {
          color: #fff;
        }

        .shop-count {
          color: #fff !important;
        }

        .platform-icon {
          color: #fff;
        }
      }

      &.all-platform {
        border: 1px dashed #409eff;
        background: #f0f9ff;
        margin-bottom: 12px;

        &.active {
          background: #409eff;
          border-color: #409eff;

          .platform-name,
          .shop-count {
            color: #fff;
          }
        }

        &:hover {
          background: #e8f4ff;
          border-color: #409eff;
        }

        &.active:hover {
          background: #409eff;
        }
      }

      .platform-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-size: 20px;
        flex-shrink: 0;
        transition: margin 0.3s;
      }

      .platform-info {
        flex: 1;

        .platform-name {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .shop-count {
          font-size: 11px;
          color: #909399;
        }
      }
    }

    .temp-groups-section {
      padding: 12px;
      border-top: 1px solid #e4e7ed;
      border-bottom: 1px solid #e4e7ed;
      height: 280px;
      display: flex;
      flex-direction: column;

      &.collapsed {
        padding: 8px;
        height: auto;
        border-bottom: none;
      }

      .temp-groups-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 0 4px;
        flex-shrink: 0;

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #3f3e3e;
        }
      }

      .temp-groups-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;

        .temp-groups-add-input--inlist {
          padding: 0 0px;
          margin-bottom: 1px;
          position: sticky;
          top: 0;
          z-index: 2;
          background: #fff;

          // 修复 placeholder（如“回车”）被裁切：统一 small 输入框高度/行高
          :deep(.el-input__wrapper) {
            height: 26px;
            line-height: 30px;
            padding-top: 0;
            padding-bottom: 0;
          }

          :deep(.el-input__inner) {
            height: 30px;
            line-height: 30px;
            font-size: 12px;
          }

          :deep(.el-input__suffix) {
            height: 30px;
            line-height: 30px;
          }
        }

        .temp-group-item {
          display: flex;
          align-items: center;
          padding: 8px 4px 8px 8px;
          margin-bottom: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          min-height: 36px;
          position: relative;

          &:hover {
            background-color: #f5f7fa;
          }

          &.drag-over {
            background-color: #ecf5ff;
            border-color: #409eff;
            box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
          }

          // 拖拽时的样式
          &.temp-group-chosen {
            opacity: 0.6;
            transform: scale(1.02);
            cursor: grabbing !important;
          }

          &.temp-group-ghost {
            opacity: 0.3;
            background: #e8f4ff !important;
            border: 1px dashed #409eff !important;
          }

          &.temp-group-drag {
            opacity: 0.8;
            transform: rotate(2deg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: grabbing !important;
          }

          .temp-group-content {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            gap: 6px;

            .temp-group-view {
              display: flex;
              align-items: center;
              flex: 1;
              min-width: 0;
              cursor: pointer;
            }

            :deep(.temp-group-edit-input) {
              width: 100%;
              max-width: none;
              flex: 1;
              min-width: 0;
            }

            .temp-group-edit-wrapper {
              flex: 1;
              min-width: 0;
            }

            .temp-group-name {
              font-size: 13px;
              color: #606266;
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .temp-group-count {
              font-size: 12px;
              color: #909399;
              margin-left: 4px;
              flex-shrink: 0;
            }
          }

          .temp-group-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s;
            flex-shrink: 0;
            // 使用正常布局占位，避免遮挡分组名
            position: static;
            margin-left: 1px;
            transform: none;

            .el-button {
              padding: 0px 0px;
              min-height: auto;
              // Element Plus 默认会给相邻按钮加 margin-left，导致图标按钮看起来距离很远
              margin-left: 0 !important;
              margin-right: -4px !important;
            }

            :deep(.el-button + .el-button) {
              margin-left: 0 !important;
            }
          }

          &:hover .temp-group-actions {
            opacity: 1;
          }
        }

        .temp-groups-empty {
          padding: 20px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      }

      .temp-groups-tip {
        flex-shrink: 0;
        padding: 0px 0px 0;
        font-size: 12px;
        color: #909399;
        text-align: center;
        user-select: none;
      }

    }

    .temp-groups-add-input {
      padding: 0 12px;
      margin-bottom: 12px;
      position: relative;

      >div {
        position: relative;
      }

      .input-icon {
        cursor: pointer;
        color: #409eff;
        font-size: 14px;
        transition: color 0.2s;

        &:hover {
          color: #66b1ff;
        }
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid #e4e7ed;
    }
  }

  // 右侧主内容区
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .content-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tabs) {
      flex-shrink: 0;

      .el-tabs__header {
        margin: 0;
        background: #fff;
        padding: 8px 0 0; // 移除左右 padding，让按钮可以贴近边界
        border-bottom: 2px solid #e4e7ed !important;
      }

      .el-tabs__content {
        display: none !important; // 隐藏默认的 tab content
      }

      .el-tabs__nav {
        border: none !important;
      }

      .el-tabs__nav-wrap {
        position: relative !important;
        // 为按钮区域预留空间，左右各留出按钮位置
        padding-left: 36px !important; // 左按钮区域（36px 按钮 + 8px 间距）
        padding-right: 36px !important; // 右按钮区域（36px 按钮 + 8px 间距）
        box-sizing: border-box !important;

        &::after {
          height: 2px !important;
          background-color: #909399 !important;
        }
      }

      // 优化左右滚动按钮的可见性和对齐
      .el-tabs__nav-prev,
      .el-tabs__nav-next {
        display: flex !important;
        visibility: visible !important; // 强制显示
        align-items: center;
        justify-content: center;
        width: 36px !important;
        height: 31px !important;
        margin-bottom: 2px !important; // 与标签的 margin-bottom 对齐
        padding: 0 !important;
        color: #fff !important;
        background-color: #409eff !important; // 明显的蓝色背景
        border: 2px solid #409eff !important;
        border-radius: 6px !important; // 与标签的圆角一致
        cursor: pointer !important;
        transition: all 0.3s;
        z-index: 100 !important; // 提高层级，确保在最上层
        box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3); // 添加阴影增强可见性
        opacity: 1 !important; // 确保不透明

        &:hover {
          color: #fff !important;
          background-color: #66b1ff !important; // 悬停时更亮的蓝色
          border-color: #66b1ff !important;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.5); // 悬停时阴影更深
          transform: translateY(-1px); // 轻微上移效果
        }

        &:active {
          background-color: #3a8ee6 !important; // 点击时更深的蓝色
          border-color: #3a8ee6 !important;
          transform: translateY(0); // 恢复位置
        }

        i {
          font-size: 18px !important;
          font-weight: 700;
        }

        &.is-disabled {
          color: #c0c4cc !important;
          background-color: #e4e7ed !important; // 禁用时灰色背景
          border-color: #e4e7ed !important;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;

          &:hover {
            color: #c0c4cc !important;
            background-color: #e4e7ed !important;
            border-color: #e4e7ed !important;
            box-shadow: none;
            transform: none;
          }
        }
      }

      .el-tabs__nav-prev {
        position: absolute !important;
        left: 0px !important; // 距离左边界 4px
        top: 0 !important;
        margin: 0 !important;
        z-index: 20 !important; // 确保在标签上方
      }

      .el-tabs__nav-next {
        position: absolute !important;
        right: 0px !important; // 距离右边界 4px
        top: 0 !important;
        margin: 0 !important;
        z-index: 20 !important; // 确保在标签上方
      }

      .el-tabs__item {
        border: 2px solid #909399 !important;
        border-radius: 6px !important;
        margin-right: 4px;
        margin-bottom: 4px;
        padding: 0 4px !important;
        height: 32px !important;
        line-height: 28px !important;
        font-size: 13px;
        background: #f5f7fa !important;
        box-sizing: border-box !important;
        background-clip: padding-box !important;
        cursor: pointer !important; // 默认使用指针样式
        transition: all 0.3s;

        // tab-label 内的元素（除了静音按钮）使用指针光标
        .tab-label .tab-shop-name {
          cursor: pointer !important;
        }

        &.is-active {
          background: #ecf5ff !important;
          border-color: #409eff !important;
          color: #409eff;
          font-weight: 500;
          z-index: 1;
          position: relative;
        }

        &:hover:not(.is-active) {
          color: #409eff;
          border-color: #606266 !important;
          background: #f0f2f5 !important;
        }

        // 拖拽时的样式
        &.tab-chosen {
          opacity: 0.6;
          transform: scale(1.02);
          cursor: grabbing !important; // 拖拽时使用抓取样式

          .tab-label .tab-shop-name {
            cursor: grabbing !important;
          }
        }

        &.tab-ghost {
          opacity: 0.3;
          background: #e8f4ff !important;
          border-color: #409eff !important;
          border-style: dashed !important;
        }

        &.tab-drag {
          opacity: 0.8;
          transform: rotate(2deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: grabbing !important; // 拖拽时使用抓取样式

          .tab-label .tab-shop-name {
            cursor: grabbing !important;
          }
        }
      }

    }

    // 关闭按钮使用点击光标 - 在 .el-tabs 层级设置
    // Element Plus 的关闭按钮通常是 .el-tabs__item 的直接子元素
    :deep(.el-tabs__nav-close),
    :deep(.el-icon-close),
    :deep(.is-icon-close) {
      cursor: pointer !important;
    }

    // 标签页的关闭按钮：选中所有不在 .tab-label 内的元素
    // 使用属性选择器和结构选择器确保覆盖所有情况
    :deep(.el-tabs__item > span:not(.tab-label)),
    :deep(.el-tabs__item > span:not(.tab-label) *),
    :deep(.el-tabs__item > i),
    :deep(.el-tabs__item > div:not(.tab-label)),
    :deep(.el-tabs__item > div:not(.tab-label) *) {
      cursor: pointer !important;
    }

    // 最后的兜底方案：匹配所有直接子元素（除了 tab-label）
    :deep(.el-tabs__item > :not(.tab-label):not(span.tab-label)),
    :deep(.el-tabs__item > :not(.tab-label):not(span.tab-label) *) {
      cursor: pointer !important;
    }

    .tab-label {
      cursor: move;

      &[draggable="true"] {
        user-select: none;

        &:active {
          opacity: 0.6;
        }
      }

      display: flex;
      align-items: center;
      gap: 6px;

      .tab-platform-icon {
        flex-shrink: 0;
        margin-right: 2px;
      }

      .tab-shop-name {
        flex: 1;
        min-width: 0; // 允许文本截断
      }

      .mute-icon-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;

        .mute-icon {
          font-size: 14px;
          transition: all 0.3s;

          &:hover {
            color: #409eff;
          }

          &.is-muted {
            color: #f56c6c; // 禁用时显示红色
          }
        }

        // 斜杠线（禁用标识）
        .mute-slash {
          position: absolute;
          width: 14px;
          height: 2px;
          background-color: #f56c6c;
          transform: rotate(-45deg);
          pointer-events: none; // 不影响点击事件
          border-radius: 1px;
        }

        &:hover {
          .mute-icon {
            color: #409eff;
          }

          .mute-slash {
            background-color: #409eff;
          }
        }
      }
    }

    // Webview 显示区域
    .webview-display-area {
      flex: 1;
      position: relative;
      overflow: hidden;
      background: #fff;
      width: 100%;
      min-height: 0; // 重要：允许 flex 子元素收缩
    }

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
  }
}

// 临时分组店铺列表样式
.temp-group-shops-list {
  .shop-items {
    .shop-item {
      padding: 12px;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }

      .shop-item-content {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .shop-info {
          display: flex;
          align-items: center;
          flex: 1;

          .shop-platform-icon {
            margin-right: 12px;
          }

          .shop-details {
            flex: 1;

            .shop-name {
              font-size: 14px;
              color: #303133;
              margin-bottom: 4px;
            }

            .shop-meta {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}

// 临时分组店铺列表样式
.temp-group-shops-list {
  .shop-items {
    .shop-item {
      padding: 12px;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }

      .shop-item-content {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .shop-info {
          display: flex;
          align-items: center;
          flex: 1;

          .shop-platform-icon {
            margin-right: 12px;
          }

          .shop-details {
            flex: 1;

            .shop-name {
              font-size: 14px;
              color: #303133;
              margin-bottom: 4px;
            }

            .shop-meta {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}

// 分组管理对话框样式
:deep(.group-manager-dialog) {
  .el-dialog__body {
    padding: 0;
  }
}

.group-manager-content {
  display: flex;
  height: 600px;
  border-top: 1px solid #e4e7ed;

  .group-list-panel,
  .shop-list-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .group-list-panel {
    width: 280px;
    border-right: 1px solid #e4e7ed;
    background: #fafafa;
  }

  .shop-list-panel {
    flex: 1;
    background: #fff;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    background: #fff;

    .panel-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .panel-actions {
      display: flex;
      gap: 8px;
    }
  }

  .group-list-container,
  .shop-list-container {
    flex: 1;
    overflow: hidden;
  }

  .loading-container,
  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
  }

  .loading-container {
    flex-direction: column;
  }

  .group-items {
    padding: 8px;
  }

  .group-item {
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: #fff;
    border: 1px solid transparent;

    &:hover {
      background: #f0f9ff;
      border-color: #b3d8ff;
    }

    &.active {
      background: #ecf5ff;
      border-color: #409eff;
      color: #409eff;

      .group-name {
        font-weight: 600;
      }
    }

    .group-item-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .group-icon {
        font-size: 18px;
        color: #409eff;
      }

      .group-name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .group-shop-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .shop-items {
    padding: 12px;
  }

  .shop-item {
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    transition: all 0.2s;

    &:hover {
      border-color: #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    }

    .shop-item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .shop-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .shop-platform-icon {
          flex-shrink: 0;
        }

        .shop-details {
          flex: 1;
          min-width: 0;

          .shop-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .shop-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            color: #909399;

            .shop-city {
              padding-left: 12px;
              border-left: 1px solid #e4e7ed;
            }
          }
        }
      }

      .shop-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
    }
  }
}
</style>