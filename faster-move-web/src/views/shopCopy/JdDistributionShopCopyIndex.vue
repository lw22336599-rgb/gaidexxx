<template>
  <div class="page-container">
    <el-tabs v-model="pageId" @tab-click="selectPage" @tab-remove="removePage">
      <el-tab-pane v-for="item in navList" :key="item.id" :closable="item.type !== 'index'" :label="item.label"
        :name="item.id" />
    </el-tabs>
    <tool-list v-if="pageId === 'index'" @use-tool="toUseTool" />
    <div v-for="item in navList.filter(obj => obj.type === 'copy-old-shop' || obj.type === 'compare-copy-shop')"
      :key="item.id">
      <shop-move-list v-show="pageId === item.id" :type="item.type" @move-shop="goMoveShop" />
    </div>
    <div v-for="item in navList.filter(obj => obj.type === 'move-shop')" :key="item.id">
      <move-shop v-show="pageId === item.id"
        :shop-data="shopDataList.filter((shop: any) => shop.office_id === item.real_id)[0]" @gettask-id="gettaskId"
        @setreleaseshow="setreleaseshow" @removePage="handleMoveShopRemove" />
    </div>
    <div v-for="item in navList.filter(obj => obj.type === 'compare-shop')" :key="item.id">
      <move-peer-shop v-show="pageId === item.id"
        :shop-data="shopDataList.filter((shop: any) => shop.office_id === item.real_id)[0]" @gettask-id="gettaskId"
        @remove-page="disteask" @setreleaseshow="setreleaseshow" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ToolList from './components/ToolList.vue'
import ShopMoveList from './components/ShopMoveList.vue'
import MoveShop from './components/MoveShop.vue'
import MovePeerShop from '/@/views/shopCopy/components/MovePeerShop.vue'
import { gp } from '/@vab/plugins/vab.ts'

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
    real_id: 'index'
  }
])
const selectPage = (item: any) => {
  console.log(item, pageId.value)
}
const removePage = (id: any) => {
  if (releaseshow.value == true) {
    if (!taskId.value) {

    }

  } else {
    // navList.value = navList.value.filter(item => item.id !== id)
    // pageId.value = 'index'
  }
  navList.value = navList.value.filter(item => item.id !== id)
  pageId.value = 'index'
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
  if (navList.value.filter(obj => obj.id === item.id).length === 0) {
    navList.value.push({
      label: item.name,
      type: item.type,
      id: item.id,
      real_id: item.id
    })
  }
  pageId.value = item.id
}
const shopDataList = ref<any>([])
const goMoveShop = (row: any) => {
  const id = `${pageId.value}${row.office_id}`

  // 检查当前店铺是否已经在标签页列表中
  const existsInNavList = navList.value.some(item => item.id === id)

  if (existsInNavList) {
    pageId.value = id
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
  navList.value.push({
    label: row.name,
    type: row.type,
    id,
    real_id: row.office_id
  })

  // 添加新的店铺数据
  shopDataList.value.push(row)

  // 更新当前页面 ID
  pageId.value = id
}
</script>

<style scoped lang="scss"></style>