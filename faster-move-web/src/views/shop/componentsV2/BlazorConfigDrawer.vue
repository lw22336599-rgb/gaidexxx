<template>
  <el-drawer v-model="drawerVisible" :before-close="handleClose" :title="title" class="blazor-config-drawer"
    :class="{ 'is-resizing': isResizing }" direction="rtl" :size="drawerWidth">
    <div class="blazor-drawer-inner">
      <!-- 左侧拖拽边，可左右调整抽屉宽度 -->
      <div class="blazor-drawer-resize-handle" @mousedown="onResizeStart" />
      <!-- 与 AllFuncSetting 一致：店铺名 + 平台图标 -->
      <div v-if="shopName || icon" class="shop-name">
        <vab-icon v-if="icon" class="logo" :icon="icon" is-custom-svg />
        <el-image v-if="shopImg" class="shop-avatar" :src="shopImg" fit="cover" />
        <div class="name-text">{{ shopName || '—' }}</div>
      </div>
      <!-- 使用 v-if 绑定到抽屉的打开状态，确保关闭时 iframe 被完全销毁 -->
      <div v-if="drawerVisible && currentUrl" class="blazor-config-box" :class="{ 'is-resizing': isResizing }">
        <iframe ref="iframeRef" :src="currentUrl" class="blazor-iframe" frameborder="0" title="功能配置" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted, nextTick } from 'vue'

const MIN_WIDTH = 400
const MAX_WIDTH = 900
const MAX_RATIO = 0.95

const drawerWidth = ref(660)
const isResizing = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const currentUrl = ref('')

onMounted(() => {
  if (typeof window !== 'undefined') {
    const maxW = Math.min(MAX_WIDTH, Math.round(MAX_RATIO * window.innerWidth))
    drawerWidth.value = Math.max(MIN_WIDTH, Math.min(maxW, Math.round(0.6 * window.innerWidth)))
  }
})

// 清理 iframe 的函数
const cleanupIframe = () => {
  if (iframeRef.value) {
    try {
      // 尝试停止 iframe 中的所有内容
      const iframeWindow = iframeRef.value.contentWindow
      if (iframeWindow) {
        // 清空 iframe 的 src，这会停止所有正在运行的脚本和加载的资源
        iframeRef.value.src = 'about:blank'
      }
    } catch (error) {
      console.warn('清理 iframe 失败:', error)
    }
  }
  // 清空 URL，这会触发 v-if，销毁 iframe DOM 节点
  currentUrl.value = ''
}

onUnmounted(() => {
  cleanupIframe()
})

function onResizeStart(e: MouseEvent) {
  e.preventDefault()
  isResizing.value = true
  const onMove = (ev: MouseEvent) => {
    const w = window.innerWidth - ev.clientX
    const maxW = Math.min(MAX_WIDTH, Math.round(MAX_RATIO * window.innerWidth))
    drawerWidth.value = Math.max(MIN_WIDTH, Math.min(maxW, w))
  }
  const onUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    url: string
    title?: string
    /** 店铺名称，与 AllFuncSetting 一致 */
    shopName?: string
    /** 平台图标名（vab-icon），与 AllFuncSetting 一致 */
    icon?: string
    /** 店铺头像，可选 */
    shopImg?: string
  }>(),
  { title: '功能设置' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const handleClose = () => {
  // 先清理 iframe
  cleanupIframe()
  
  // 然后关闭抽屉
  emit('close')
  emit('update:modelValue', false)
}

// 监听抽屉打开状态，当打开时加载 URL
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && props.url) {
    // 抽屉打开时，加载 URL
    await nextTick()
    currentUrl.value = props.url
  } else if (!isOpen) {
    // 抽屉关闭时，清理 iframe
    cleanupIframe()
  }
}, { immediate: true })

// 监听 URL 变化
watch(() => props.url, (newUrl) => {
  if (props.modelValue && newUrl) {
    currentUrl.value = newUrl
  }
})
</script>

<style scoped lang="scss">
/* 覆盖 el-drawer direction=rtl 带来的 RTL，保持与 AllFuncSetting 一致：正文与店铺名均左对齐 */
.blazor-drawer-inner {
  position: relative;
  direction: ltr;
  text-align: left;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 左侧拖拽边：左右拖动可调整抽屉宽度 */
.blazor-drawer-resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

/* 用 block + inline-block 替代 flex，避免 el-drawer rtl 下 flex 把内容排到右边；与 AllFuncSetting 一致左对齐 */
.shop-name {
  display: block;
  flex-shrink: 0;
  margin-bottom: 16px;
  padding-left: 20px;
  direction: ltr;
  text-align: left;

  :deep(.vab-icon.logo),
  .shop-avatar,
  .name-text {
    display: inline-block;
    vertical-align: middle;
  }

  .vab-icon.logo {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  .shop-avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    margin-right: 10px;
  }

  .name-text {
    font-size: 18px;
    font-weight: 600;
  }
}

.blazor-config-box {
  flex: 1;
  min-height: 0;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;

  /* 拖拽调整宽度时，让 iframe 不捕获鼠标，避免 mousemove 被 iframe 吞掉导致无法调小 */
  &.is-resizing {
    pointer-events: none;
  }
}

.blazor-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  margin: 0;
}
</style>

<!-- 非 scoped：el-drawer 用 Teleport 挂到 body，:deep 无法命中，用 .blazor-config-drawer 限定仅本抽屉 -->
<style lang="scss">
.blazor-config-drawer.el-drawer .el-drawer__body {
  direction: ltr;
  /* 覆盖 rtl 抽屉的 RTL，使店铺名、正文与 AllFuncSetting 一致左对齐 */
  padding: 0 !important;
  margin: 0 !important;
  overflow: hidden;
  height: calc(100vh - 54px);
}

/* 拖拽调整宽度时关掉抽屉的 transition，否则 width 会被平滑过渡，产生滞后感 */
.blazor-config-drawer.el-drawer.is-resizing {
  transition: none !important;
}
</style>
