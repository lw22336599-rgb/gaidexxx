<template>
  <div ref="floatButtonRef" class="customer-service-float-button" :class="{ dragging: isDragging }"
    :style="floatButtonStyle" @mousedown="handleDragStart" @touchstart="handleDragStart">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
      <el-button circle type="primary" size="large" @click="handleOpenChat">
        <el-icon :size="24">
          <ChatDotRound />
        </el-icon>
      </el-button>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import { useAclStore } from '/@/store/modules/acl'
import { signalRManager } from '/@/customer-service/utils/signalRManager'
import { apiManager } from '/@/TsModel/Api/ApiManager'

defineOptions({
  name: 'CustomerServiceFloatButton',
})

// 定义事件
const emit = defineEmits<{
  (e: 'open-chat'): void
}>()

const aclStore = useAclStore()
const unreadCount = ref(0)
const floatButtonRef = ref<HTMLElement>()

// 浮球位置（使用 left 和 top 坐标）
const position = reactive({
  left: 0,
  top: 0,
})

// 拖动相关状态
const isDragging = ref(false)
const dragStartPos = reactive({ x: 0, y: 0 })
const dragStartOffset = reactive({ x: 0, y: 0 })

// 计算浮球样式
const floatButtonStyle = computed(() => {
  return {
    left: `${position.left}px`,
    top: `${position.top}px`,
  }
})

/**
 * 判断当前用户是否是客服
 */
const isCustomerService = computed(() => {
  return aclStore.getRole.includes('KEFU')
})

/**
 * 更新未读消息数
 * 调用 IM API 获取未读消息数
 */
const updateUnreadCount = async () => {
  if (!isCustomerService.value) {
    return
  }

  try {
    const result = await apiManager.imManageApi.GetUnreadCount()
    unreadCount.value = result.TotalUnreadCount || 0
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

/**
 * 处理打开聊天
 */
const handleOpenChat = () => {
  // 如果刚刚在拖动，不触发点击事件
  if (isDragging.value) {
    return
  }
  // 触发打开聊天事件，由父组件显示抽屉
  emit('open-chat')
}

/**
 * 初始化浮球位置（右下角）
 */
const initPosition = () => {
  if (!floatButtonRef.value) return

  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const buttonWidth = floatButtonRef.value.offsetWidth || 60
  const buttonHeight = floatButtonRef.value.offsetHeight || 60

  // 默认在右下角，距离边缘30px
  position.left = windowWidth - buttonWidth - 30
  position.top = windowHeight - buttonHeight - 80
}

/**
 * 处理拖动开始
 */
const handleDragStart = (e: MouseEvent | TouchEvent) => {
  // 阻止默认行为
  e.preventDefault()

  // 获取初始触摸/鼠标位置
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  dragStartPos.x = clientX
  dragStartPos.y = clientY
  dragStartOffset.x = position.left
  dragStartOffset.y = position.top

  // 标记为拖动状态
  isDragging.value = false // 初始不是拖动状态，只有移动超过阈值才算

  // 添加事件监听
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDragMove)
  document.addEventListener('touchend', handleDragEnd)
}

/**
 * 处理拖动移动
 */
const handleDragMove = (e: MouseEvent | TouchEvent) => {
  // 获取当前触摸/鼠标位置
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  // 计算移动距离
  const deltaX = clientX - dragStartPos.x
  const deltaY = clientY - dragStartPos.y

  // 如果移动超过5px，则认为是拖动
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging.value = true
  }

  // 计算新位置
  let newLeft = dragStartOffset.x + deltaX
  let newTop = dragStartOffset.y + deltaY

  // 限制在窗口范围内
  if (floatButtonRef.value) {
    const buttonWidth = floatButtonRef.value.offsetWidth
    const buttonHeight = floatButtonRef.value.offsetHeight
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    newLeft = Math.max(0, Math.min(newLeft, windowWidth - buttonWidth))
    newTop = Math.max(0, Math.min(newTop, windowHeight - buttonHeight))
  }

  position.left = newLeft
  position.top = newTop
}

/**
 * 处理拖动结束
 */
const handleDragEnd = () => {
  // 移除事件监听
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)

  // 延迟重置拖动状态，避免点击事件被触发
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// 监听 SignalR 红点数变化
onMounted(() => {
  // 初始化浮球位置（不管是否有客服角色都要显示浮球）
  nextTick(() => {
    initPosition()
  })

  // 监听窗口大小变化，确保浮球不超出边界
  window.addEventListener('resize', initPosition)

  // 如果有客服角色，才加载未读消息数和注册 SignalR 监听
  if (isCustomerService.value) {
    // 首次加载时获取未读消息数
    updateUnreadCount()

    // 注册红点数变化回调
    signalRManager.onBadgeCountChange(() => {
      // 当收到新消息时，重新获取未读消息数
      updateUnreadCount()
    })
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', initPosition)
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
})
</script>

<style lang="scss" scoped>
.customer-service-float-button {
  position: fixed;
  z-index: 9999;
  cursor: move;
  transition: transform 0.3s;
  user-select: none;

  &:hover:not(.dragging) {
    transform: scale(1.1);
  }

  &.dragging {
    cursor: grabbing;
    transition: none;

    :deep(.el-button) {
      pointer-events: none;
    }
  }

  :deep(.el-button) {
    width: 60px;
    height: 60px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    }
  }

  :deep(.el-badge__content) {
    transform: translateX(50%) translateY(-50%);
  }
}
</style>