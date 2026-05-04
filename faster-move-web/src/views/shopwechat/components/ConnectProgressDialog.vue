<template>
  <el-dialog
    v-model="dialogVisible"
    title="连接微信机器人"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="canClose"
    width="600px"
    @close="handleClose"
  >
    <div class="progress-container">
      <el-steps :active="currentStep" direction="vertical" finish-status="success">
        <el-step title="准备工作包" />

        <el-step title="下载工作包">
          <template #description>
            <div v-if="currentStep === 1 && downloadProgress" class="download-progress">
              <el-progress
                :percentage="downloadProgress.percentage"
                :status="downloadProgress.percentage === 100 ? 'success' : undefined"
              />
              <div class="download-info">
                <span class="info-item">
                  {{ formatSize(downloadProgress.loaded) }} / {{ formatSize(downloadProgress.total) }}
                </span>
                <span v-if="downloadProgress.speed" class="info-item">
                  {{ formatSpeed(downloadProgress.speed) }}
                </span>
                <span v-if="downloadProgress.remaining" class="info-item">
                  剩余 {{ formatTime(downloadProgress.remaining) }}
                </span>
              </div>
            </div>
          </template>
        </el-step>

        <el-step title="解压工作包" />
        <el-step title="启动微信客户端" />
        <el-step title="等待扫码登录">
          <template #description>
            <div v-if="currentStep === 4" class="scan-tip">
              <el-icon class="scan-icon">
                <Iphone />
              </el-icon>
              <span>请使用手机微信扫码登录</span>
            </div>
          </template>
        </el-step>
        <el-step title="同步账号信息" />
        <el-step title="建立SignalR连接" />
        <el-step title="同步联系人数据" />
        <el-step title="连接完成">
          <template #description>
            <div v-if="currentStep === 8" class="complete-tip">
              <el-icon class="success-icon">
                <CircleCheck />
              </el-icon>
              <span>微信机器人连接成功！</span>
            </div>
          </template>
        </el-step>
      </el-steps>

      <!-- 错误提示 -->
      <el-alert
        v-if="errorMessage"
        type="error"
        :title="errorMessage"
        :closable="false"
        show-icon
        style="margin-top: 20px"
      />

      <!-- 状态消息 -->
      <div v-if="statusMessage && !errorMessage" class="status-message">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <span>{{ statusMessage }}</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="canCancel && !isComplete && !isWaitingForLogin" @click="handleCancel">取消</el-button>
        <el-button v-if="isWaitingForLogin" type="primary" @click="handleConfirmLogin">
          <el-icon style="margin-right: 4px">
            <CircleCheck />
          </el-icon>
          我已登陆
        </el-button>
        <el-button v-if="errorMessage" type="danger" @click="handleRetry">重试</el-button>
        <el-button v-if="isComplete" type="primary" @click="handleClose">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CircleCheck, Loading, Iphone } from '@element-plus/icons-vue'
import { useWechatRobotStore } from '@/store/modules/wechatRobot'
import { ConnectStep, type DownloadProgress } from '@/types/wechat'
import { formatSize, formatSpeed, formatTime } from '@/services/wechat/WxWorkPackageManager'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'retry'): void
  (e: 'complete'): void
  (e: 'confirm-login'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const wechatRobotStore = useWechatRobotStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

// 当前步骤
const currentStep = computed(() => {
  const progress = wechatRobotStore.getConnectProgress
  if (!progress) return 0
  return progress.step
})

// 下载进度
const downloadProgress = computed<DownloadProgress | undefined>(() => {
  const progress = wechatRobotStore.getConnectProgress
  return progress?.downloadProgress
})

// 状态消息
const statusMessage = computed(() => {
  const progress = wechatRobotStore.getConnectProgress
  return progress?.message || ''
})

// 错误消息
const errorMessage = computed(() => {
  const progress = wechatRobotStore.getConnectProgress
  return progress?.error || ''
})

// 是否可以取消
const canCancel = computed(() => {
  const progress = wechatRobotStore.getConnectProgress
  return progress?.canCancel ?? true
})

// 是否可以关闭
const canClose = computed(() => {
  return isComplete.value || errorMessage.value !== ''
})

// 是否完成
const isComplete = computed(() => {
  return currentStep.value === ConnectStep.Completed
})

// 是否在等待登录确认
const isWaitingForLogin = computed(() => {
  return currentStep.value === ConnectStep.WaitingScan
})

// 处理确认登录
const handleConfirmLogin = () => {
  console.log('[对话框] 用户点击了"我已登陆"按钮')
  emit('confirm-login')
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  wechatRobotStore.clearConnectProgress()
  dialogVisible.value = false
}

// 处理重试
const handleRetry = () => {
  wechatRobotStore.clearConnectProgress()
  emit('retry')
}

// 处理关闭
const handleClose = () => {
  if (isComplete.value) {
    emit('complete')
  }
  wechatRobotStore.clearConnectProgress()
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.progress-container {
  min-height: 400px;
  padding: 20px 0;
}

.download-progress {
  margin-top: 12px;

  .download-info {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .info-item {
      flex: 1;
      text-align: center;
    }
  }
}

.scan-tip,
.complete-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: var(--el-color-primary);

  .scan-icon,
  .success-icon {
    font-size: 20px;
  }
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);

  .loading-icon {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
