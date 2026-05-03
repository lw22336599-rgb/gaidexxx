<template>
  <div class="page-container">
    <el-tabs v-model="pageId" @tab-click="selectPage" @tab-remove="removePage">
      <el-tab-pane v-for="item in navList" :key="item.id" :closable="item.type !== 'index'" :label="item.label"
        :name="item.id" />
    </el-tabs>
    <tool-list v-if="pageId === 'index'" @use-tool="toUseTool" />
    <div v-for="item in navList.filter(obj => obj.toUse)" :key="item.id">
      <shop-move-list v-show="pageId === item.id" :type="item.type" @move-shop="goMoveShop" />
    </div>
    <div v-for="item in navList.filter(obj => obj.type === 'move-shop' && !obj.toUse)" :key="item.id">
      <move-shop @gettaskId="gettaskId" @setreleaseshow="setreleaseshow" @removePage="handleMoveShopRemove"
        @registerShopIds="(payload: { shopIds: string[] }) => handleRegisterShopIds(item.id, payload.shopIds)"
        v-show="pageId === item.id"
        :nav-item-id="item.id"
        :shop-data="shopDataList.find((shop: any) => shop && shop.office_id === item.real_id) || null"
        :task-id="item.taskId" :old-shop="item.oldShop" />
    </div>
    <div v-for="item in navList.filter(obj => obj.type === 'compare-shop' && !obj.toUse)" :key="item.id">
      <move-peer-shop @gettaskId="gettaskId" @setreleaseshow="setreleaseshow" @removePage="disteask"
        @registerShopIds="(payload: { shopIds: string[] }) => handleRegisterShopIds(item.id, payload.shopIds)"
        v-show="pageId === item.id"
        :nav-item-id="item.id"
        :shop-data="shopDataList.filter((shop: any) => shop.office_id === item.real_id)[0]"
        :task-id="item.taskId" :old-shop="item.oldShop" />
    </div>
    <div
      v-for="item in navList.filter(obj => !obj.toUse && (obj.type === 'batch-price' || obj.type === 'updat-foodimg'))"
      :key="item.id">
      <food-manage @gettaskId="gettaskId" @setreleaseshow="setreleaseshow" v-show="pageId === item.id"
        :shop-data="shopDataList.filter((shop: any) => shop.office_id === item.real_id)[0]" :tab-type="item.type" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolList from './components/ToolList.vue'
import ShopMoveList from './components/ShopMoveList.vue'
import MoveShop from './components/MoveShop.vue'
import MovePeerShop from '/@/views/shopCopy/components/MovePeerShop.vue'
import FoodManage from '/@/views/foodManage/index.vue'
import { gp } from '/@vab/plugins/vab.ts'

import { ToolType } from '/@/types/shop'

defineOptions({
  name: 'MtShopCopy'
})
const pageId = ref('index')
const taskId = ref('')
const releaseshow = ref(false)
const gettaskId = (val: string) => {
  taskId.value = val
}
const setreleaseshow = (val: boolean) => {
  releaseshow.value = val
}
const navList = ref([
  {
    label: '首页',
    type: 'index',
    id: 'index',
    real_id: 'index',
    toUse: false
  }
])

// 记录标签页访问顺序，用于关闭标签页时切换到上一个访问的标签页
const pageVisitHistory = ref<string[]>(['index'])

/**
 * 记录标签页访问
 */
const recordPageVisit = (pageIdValue: string) => {
  // 如果已经在历史记录中，先移除
  const index = pageVisitHistory.value.indexOf(pageIdValue)
  if (index > -1) {
    pageVisitHistory.value.splice(index, 1)
  }
  // 添加到最前面（最近访问的）
  pageVisitHistory.value.unshift(pageIdValue)
}

const selectPage = (item: any) => {
  console.log(item, pageId.value)
  // 记录标签页访问（el-tabs 的 tab-click 事件传递的是 tab-pane 的 name 值）
  if (item && (item.name || item.paneName)) {
    const targetPageId = item.name || item.paneName || pageId.value
    recordPageVisit(targetPageId)
  } else if (pageId.value) {
    recordPageVisit(pageId.value)
  }
}

const handleRegisterShopIds = (navItemId: string, shopIds: string[]) => {
  const item = navList.value.find((i) => i.id === navItemId)
  if (item) item.shopIds = shopIds || []
}

/**
 * 关闭标签页
 * 如果关闭的是当前标签页，则切换到上一个访问的标签页（如果存在），否则切换到首页
 * 复制页面关闭时，关闭远程浏览器中关联的店铺；若无店铺则关闭整个远程浏览器
 */
const removePage = (id: any) => {
  if (releaseshow.value == true) {
    if (!taskId.value) {

    }

  } else {
    //
  }

  // 从访问历史中移除
  const historyIndex = pageVisitHistory.value.indexOf(id)
  if (historyIndex > -1) {
    pageVisitHistory.value.splice(historyIndex, 1)
  }

  // 复制页面关闭时：关闭远程浏览器中关联的店铺（转为纯数组避免 IPC 克隆错误）
  const removedItem = navList.value.find((item) => item.id === id)
  const rawShopIds = removedItem?.shopIds
  const shopIdsToClose = Array.isArray(rawShopIds)
    ? rawShopIds.map((x: any) => String(x)).filter(Boolean)
    : []
  if (shopIdsToClose.length > 0 && (removedItem?.type === 'move-shop' || removedItem?.type === 'compare-shop')) {
    const electron = (globalThis as any).electron
    if (electron?.closeRemoteBrowserShops) {
      electron.closeRemoteBrowserShops(shopIdsToClose).catch(() => {})
    }
  }

  // 从标签页列表中移除
  navList.value = navList.value.filter(item => item.id !== id)

  // 如果关闭的是当前标签页，需要切换到其他标签页
  if (pageId.value === id) {
    // 找到上一个访问的标签页（排除当前关闭的标签页）
    const previousPageId = pageVisitHistory.value.find(pid =>
      pid !== id && navList.value.some(item => item.id === pid)
    )

    // 如果找到上一个访问的标签页，切换到它；否则切换到首页
    pageId.value = previousPageId || 'index'
  }
}
const disteask = () => {
  // 检查是否正在释放连接
  if (releaseshow.value == true) {
    if (!taskId.value) {
      return gp.$baseMessage('请获取到店铺数据后关闭连接', 'error', 'hey')
    }
  }

  // 关闭当前标签页并切换到首页
  removePage(pageId.value)
}

/**
 * 处理 MoveShop 组件关闭标签页请求
 */
const handleMoveShopRemove = () => {
  // 检查是否正在释放连接
  if (releaseshow.value == true) {
    if (!taskId.value) {
      return gp.$baseMessage('请获取到店铺数据后关闭连接', 'error', 'hey')
    }
  }

  // 关闭当前标签页并切换到首页
  removePage(pageId.value)
}
const toUseTool = (item: any) => {
  console.log(item, "toUseTool")
  if (navList.value.filter(obj => obj.id === item.id).length === 0) {
    navList.value.push({
      label: item.name,
      type: item.type,
      id: item.id,
      real_id: item.id,
      toUse: item.toUse
    })
  }
  pageId.value = item.id
  // 记录标签页访问
  recordPageVisit(item.id)
}

const shopDataList = ref<any>([])
const goMoveShop = (row: any) => {
  // 验证 row 数据是否完整
  if (!row || !row.office_id) {
    gp.$baseMessage('店铺数据不完整，无法打开页面', 'error', 'hey')
    return
  }

  const id = `${pageId.value}${row.office_id}`
  console.log(id, "goMoveShop");
  // 检查当前店铺是否已经在标签页列表中
  const existsInNavList = navList.value.some(item => item.id === id)

  if (existsInNavList) {
    pageId.value = id
    // 记录标签页访问
    recordPageVisit(id)
    return
  }

  // 判断是否为竞对店铺复制类型
  if (row.type === 'compare-shop') {
    const hasCompareShop = navList.value.some(item => item.type === 'compare-shop')
    if (hasCompareShop) {
      // 使用全局提示显示错误信息
      gp.$baseMessage('只允许打开一个竞对店铺复制', 'warning', 'hey')
      return
    }
  }

  // 添加新的标签页
  const navItem: any = {
    label: row.name || '未命名店铺',
    type: row.type,
    id,
    real_id: row.office_id,
    toUse: false,
    shopIds: row.id ? [row.id] : []
  }

  // 如果从任务列表进入，保存 taskId 和 oldShop
  if (row.taskId) {
    navItem.taskId = row.taskId
    navItem.oldShop = row.oldShop
  }

  navList.value.push(navItem)

  // 添加新的店铺数据
  shopDataList.value.push(row)

  // 更新当前页面 ID
  pageId.value = id
  // 记录标签页访问
  recordPageVisit(id)
}
//组件被卸载时
onUnmounted(() => {
  console.log('组件被卸载，当前标签页数量:', navList.value.length)
})
// 组件激活时恢复状态
onActivated(() => {
  console.log('组件被激活，当前标签页数量:', navList.value.length)
})

// 组件停用时保存状态
onDeactivated(() => {
  console.log('组件被停用，当前标签页数量:', navList.value.length)
})
</script>

<style scoped lang="scss">
// 移除了不必要的样式，让组件使用全局默认样式</style>