<template>
  <div class="vab-right-tools">
    <vab-search v-show="!isHorizontal" class="hidden-xs-only" />
    <div class="vab-right-tools-draggable">
      <el-button type="primary" @click="openChat">
        <vab-icon icon="customer-service-2-fill" />
        <span style="margin-left: 6px">在线客服</span>
      </el-button>
      <div class="doc-button" @click="toggle">
        <vab-icon class="book-2-line" icon="book-2-line" size="24" />
        <span class="doc-label">文档</span>
      </div>
      <vab-dark v-show="theme.showDark" :style="!isHorizontal ? '' : { marginLeft: 'var(--el-margin)' }" />
      <vab-notice v-show="theme.showNotice" />
      <vab-theme v-show="theme.showTheme && routeName !== 'SeparateLayout'" />
      <vab-error-log class="hidden-xs-only" />
      <vab-lock v-show="theme.showLock" />
      <vab-color-picker v-show="theme.showColorPicker" />
      <vab-font-size v-show="theme.showFontSize" />
      <vab-language v-show="theme.showLanguage" />
      <vab-fullscreen v-show="theme.showFullScreen" />
      <vab-refresh v-show="theme.showRefresh" />
      <vab-feedback />
    </div>
    <vab-avatar />
  </div>
</template>

<script lang="ts" setup>
import Sortable from 'sortablejs'
import { useSystemConfigStore } from '/@/store/modules/systemConfig'
import { useSettingsStore } from '/@/store/modules/settings'
import Button from '@/views/vab/form/button.vue'

defineOptions({
  name: 'VabRightTools',
})

defineProps({
  isHorizontal: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const settingsStore = useSettingsStore()
const { theme, device } = storeToRefs(settingsStore)
const routeName = ref<any>(route.name)
const systemConfigStore = useSystemConfigStore()
const customerServiceUrl = computed(() => systemConfigStore.getCustomerServiceUrl)

let sortable: any
const handleTabDrag = () => {
  if (theme.value.rightToolsDrag && device.value != 'mobile') {
    const toolsElement = document.querySelector('.vab-right-tools-draggable') as HTMLElement | null

    if (toolsElement)
      sortable = new Sortable(toolsElement, {
        animation: 150,
        easing: 'cubic-bezier(1, 0, 0, 1)',
      })
  }
}

const toggle = () => {
  const electron = (globalThis as any).electron
  if (electron && typeof electron.openNewWindowUrl === 'function') {
    electron.openNewWindowUrl('https://www.yuque.com/stussy-90mja/lxhs9e?#')
  }
}
const openChat = () => {
  const url = customerServiceUrl.value
  if (!url) throw new Error('未配置在线客服地址')
  const electron = (globalThis as any).electron
  if (electron && typeof electron.openNewWindowUrl === 'function') {
    electron.openNewWindowUrl(url)
    return
  }
  window.open(url, '_blank')
}

watch(
  route,
  () => {
    routeName.value = route.name
  },
  { immediate: true }
)

onMounted(() => {
  nextTick(() => {
    handleTabDrag()
  })
  systemConfigStore.ensureConfig()
})

watch(
  theme.value,
  () => {
    if (theme.value.rightToolsDrag) handleTabDrag()
    else sortable && sortable.destroy()
  },
  {
    immediate: true,
  }
)
</script>

<style lang="scss" scoped>
.vab-right-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  &-draggable {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }
}

.book-2-line {
  font-size: 20px;
  margin-right: 0;
  display: block;
}

.doc-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  text-align: center;

  .doc-label {
    margin: 5px -15px 0px 4px;
    font-size: 12px;
    text-align: center;
  }
}
</style>