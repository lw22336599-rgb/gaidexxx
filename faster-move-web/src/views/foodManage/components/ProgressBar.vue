<template>
  <div class="progress-bar">
    <div class="progress-bar__header">
      <span class="progress-bar__title">{{ title }}</span>
      <el-button v-if="showStop" type="danger" size="small" @click="handleStop">停止任务</el-button>
    </div>
    <div class="progress-bar__content">
      <el-progress :percentage="percentage" :status="progressStatus" :format="format" />
      <div v-if="currentMessage" class="progress-bar__message">
        {{ currentMessage }}
      </div>
      <div v-if="errorMessages.length > 0" class="progress-bar__errors">
        <div v-for="(error, index) in errorMessages" :key="index" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { abortStreamRequest } from '/@/api/foodManage'
import type { FoodManageApi } from '../types/api'
import { PropType } from 'vue'

const props = defineProps({
  // 业务任务ID
  taskId: {
    type: String,
    required: true
  },
  // 请求ID，用于中断请求
  requestId: {
    type: String,
    required: true
  },
  // 任务标题
  title: {
    type: String,
    default: '任务进度'
  },
  // 是否显示停止按钮
  showStop: {
    type: Boolean,
    default: true
  },
  // 流式请求方法
  streamMethod: {
    type: Function as PropType<
      (params: any, onProgress?: (progress: FoodManageApi.ProgressInfo) => void, requestId?: string) => Promise<any>
    >,
    required: true
  },
  // 请求参数
  requestParams: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete', 'error', 'stop'])

// 进度相关状态
const percentage = ref(0)
const currentMessage = ref('')
const errorMessages = ref<string[]>([])
const isRunning = ref(false)
const totalTasks = ref(0)
const MAX_ERROR_MESSAGES = 50

// 计算进度条状态
const progressStatus = computed(() => {
  if (errorMessages.value.length > 0) return 'exception'
  if (percentage.value === 100) return 'success'
  return ''
})

// 格式化进度显示
const format = (percentage: number) => {
  return `${percentage}%`
}

// 监听属性变化
watch(
  () => props.requestParams,
  newVal => {
    console.log('requestParams changed:', newVal)
  },
  { immediate: true }
)

watch(
  () => props.taskId,
  newVal => {
    console.log('taskId changed:', newVal)
  },
  { immediate: true }
)

watch(
  () => props.requestId,
  newVal => {
    console.log('requestId changed:', newVal)
  },
  { immediate: true }
)

// 开始任务
const startTask = async () => {
  if (isRunning.value) return

  isRunning.value = true
  percentage.value = 0
  currentMessage.value = '正在连接服务器，准备开始修改价格...'
  errorMessages.value = []

  // 记录开始时间，确保进度条至少显示一段时间
  const startTime = Date.now()
  const minDisplayTime = 800 // 最小显示时间800ms，让用户能看到进度

  try {
    console.log('开始任务，参数:', {
      requestParams: props.requestParams,
      requestId: props.requestId,
      taskId: props.taskId
    })

    // 先显示一个初始进度，让用户知道任务已开始
    setTimeout(() => {
      if (isRunning.value && percentage.value === 0) {
        currentMessage.value = '正在修改商品价格，请稍候...'
      }
    }, 100)

    await props.streamMethod(
      props.requestParams,
      (progress: FoodManageApi.ProgressInfo) => {
        console.log('收到进度更新:', progress)
        totalTasks.value = progress.Total || 0
        // 计算实际进度百分比
        if (totalTasks.value > 0) {
          percentage.value = Math.round((progress.Progress / totalTasks.value) * 100)
        } else {
          // 如果没有总数，显示一个不确定的进度
          percentage.value = progress.Progress > 0 ? Math.min(99, progress.Progress) : 5
        }

        // 更新消息
        if (progress.Item) {
          currentMessage.value = progress.Item
        } else if (totalTasks.value > 0) {
          currentMessage.value = `正在处理 ${progress.Progress}/${totalTasks.value} 个商品...`
        } else {
          currentMessage.value = '正在修改商品价格，请稍候...'
        }

        if (progress.ErrMsg && progress.ErrMsg.length > 0) {
          errorMessages.value = [...progress.ErrMsg, ...errorMessages.value].slice(0, MAX_ERROR_MESSAGES)
        }

        if (progress.IsFinished) {
          // 确保进度条至少显示最小时间
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, minDisplayTime - elapsed)

          setTimeout(() => {
            isRunning.value = false
            percentage.value = 100
            currentMessage.value = '所有商品价格修改完成！'
            emit('complete')
          }, remaining)
        }
      },
      props.requestId
    )
  } catch (error) {
    console.error('任务执行失败:', error)
    // 确保进度条至少显示最小时间
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDisplayTime - elapsed)

    setTimeout(() => {
      isRunning.value = false
      currentMessage.value = '任务执行失败'
      ElMessage.error('任务执行失败')
      emit('error', ['任务执行失败'])
    }, remaining)
  }
}

// 停止任务
const handleStop = () => {
  abortStreamRequest(props.requestId)
  isRunning.value = false
  emit('stop')
}

// 暴露方法给父组件
defineExpose({
  startTask
})
</script>

<style lang="scss" scoped>
.progress-bar {
  padding: 12px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 15px;
    font-weight: 500;
  }

  &__content {
    .progress-bar__message {
      margin-top: 6px;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }

    .progress-bar__errors {
      margin-top: 12px;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 8px;

      .error-message {
        color: var(--el-color-danger);
        font-size: 13px;
        margin-bottom: 3px;
        padding: 3px 6px;
        background-color: var(--el-color-danger-light-9);
        border-radius: 3px;
        border-left: 2px solid var(--el-color-danger);
      }
    }
  }
}
</style>
