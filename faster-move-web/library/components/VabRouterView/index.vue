<template>
  <router-view v-slot="{ Component }">
    <transition :mode="transitionMode" :name="pageTransitionName">
      <keep-alive :include="keepAliveNameList" :max="keepAliveMaxNum">
        <component :is="Component" :key="routerKey" ref="componentRef" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import VabProgress from 'nprogress'
import { keepAliveMaxNum } from '/@/config'
import { useSettingsStore } from '/@/store/modules/settings'
import { useTabsStore } from '/@/store/modules/tabs'
import { handleActivePath } from '/@/utils/routes'

defineOptions({
  name: 'VabRouterView',
})

const route = useRoute()
const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)
const tabsStore = useTabsStore()
const { getVisitedRoutes: visitedRoutes } = storeToRefs(tabsStore)
const componentRef = ref<any>()
const routerKey = ref<any>()
const keepAliveNameList = ref<any>()
const siteData = reactive<any>({
  description: '',
})

useHead({
  meta: [
    {
      name: `description`,
      content: computed(() => siteData.description),
    },
  ],
})

const updateKeepAliveNameList = (refreshRouteName = null) => {
  // 基础：根据已访问路由生成 keep-alive 名称列表
  const baseList = visitedRoutes.value
    .filter((item) => !item.meta.noKeepAlive && item.name !== refreshRouteName)
    .flatMap((item) => {
      // 优先使用组件名称，如果没有则使用路由名称
      return item.meta.componentName || item.name
    })

  // 始终强制缓存的页面：门店管理 V2 的三种版本
  const extraKeepAliveNames = ['MtFeatureV2', 'MtFeatureV2Functional', 'MtFeatureV2Operation']

  // 合并并去重
  keepAliveNameList.value = Array.from(new Set([...baseList, ...extraKeepAliveNames]))
}

// 门店管理 V2 三个版本的路由 name，用于特殊处理过渡动画
const versionRouteNames = ['ShopV2Index', 'ShopV2Functional', 'ShopV2Operation']

// 对于这三个版本的页面，关闭页面过渡动画，避免切换时短暂白屏
const pageTransitionName = computed(() => {
  return versionRouteNames.includes(route.name as string) ? '' : theme.value.pageTransition
})

// 版本页面使用默认过渡模式，其它页面保持原来的 out-in
const transitionMode = computed(() => {
  return versionRouteNames.includes(route.name as string) ? 'default' : 'out-in'
})

// 更新KeepAlive缓存页面
watchEffect(() => {
  routerKey.value = handleActivePath(route, true)
  updateKeepAliveNameList()
  siteData.description = `${'Vue'} ${'Shop'} ${'Vite'}-${route.meta.title}简介、官网、首页、文档和下载 - 前端开发框架`
})

onBeforeMount(() => {
  $sub('reload-router-view', (refreshRouteName: any = route.name) => {
    if (theme.value.showProgressBar) VabProgress.start()
    const cacheActivePath = routerKey.value
    routerKey.value = null
    updateKeepAliveNameList(refreshRouteName)
    nextTick(() => {
      routerKey.value = cacheActivePath
      updateKeepAliveNameList()
    })
    setTimeout(() => {
      if (theme.value.showProgressBar) VabProgress.done()
    }, 200)
  })
})
</script>