<template>
  <vab-dialog
    v-model="show"
    append-to-body
    class="electron-update"
    :show-close="false"
    :show-fullscreen="false"
    width="550px"
  >
    <template #header />
    <div class="electron-update-icon">
      <vab-icon icon="upload-cloud-2-fill" />
    </div>
    <vab-icon class="electron-update-cup" icon="cup-line" />
    <h3>发现新版本：{{ updateInfo.version }}</h3>
    <p class="update-date">发布时间：{{ formatDate(updateInfo.releaseDate) }}</p>

    <div v-if="updateInfo.releaseNotes" class="release-notes">
      <h4>更新内容：</h4>
      <pre>{{ updateInfo.releaseNotes }}</pre>
    </div>

    <div v-if="downloading" class="download-progress">
      <el-progress :percentage="Math.floor(downloadProgress.percent)" :status="downloadStatus" />
      <p class="progress-text">
        {{ formatBytes(downloadProgress.transferred) }} / {{ formatBytes(downloadProgress.total) }}
      </p>
    </div>

    <template #footer>
      <div v-if="!downloading && !errorMessage" class="update-actions">
        <el-button :loading="startingDownload" type="primary" @click="handleUpdate(false)">
          {{ startingDownload ? '准备下载...' : '立即更新' }}
        </el-button>
        <el-button :loading="startingDownload" @click="handleUpdate(true)"> 后台更新 </el-button>
        <el-button type="info" text @click="handleIgnoreThisTime"> 忽略更新 </el-button>
      </div>
      <div v-if="downloading" class="downloading-tip">
        <p v-if="isBackgroundDownload">
          {{ backgroundDownloadMode ? '正在后台下载更新...' : '正在下载更新包，下载完成后将自动安装并重启应用...' }}
        </p>
        <p v-else>正在下载更新包，下载完成后将自动安装并重启应用...</p>
        <el-button v-if="isBackgroundDownload" size="small" text @click="minimizeDialog"> 最小化到后台 </el-button>
      </div>
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="show = false">关闭</el-button>
      </div>
    </template>
  </vab-dialog>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'

defineOptions({
  name: 'ElectronUpdate'
})

// 更新信息
interface UpdateInfo {
  version: string
  releaseNotes: string
  releaseDate: string
  canDownload: boolean
}

// 下载进度信息
interface DownloadProgress {
  percent: number
  transferred: number
  total: number
}

const show = ref<boolean>(false)
const startingDownload = ref<boolean>(false)
const downloading = ref<boolean>(false)
const errorMessage = ref<string>('')
const isBackgroundDownload = ref<boolean>(false)
const backgroundDownloadMode = ref<boolean>(false)

const updateInfo = ref<UpdateInfo>({
  version: '',
  releaseNotes: '',
  releaseDate: '',
  canDownload: true
})

const downloadProgress = ref<DownloadProgress>({
  percent: 0,
  transferred: 0,
  total: 0
})

const downloadStatus = computed(() => {
  if (errorMessage.value) return 'exception'
  if (downloadProgress.value.percent >= 100) return 'success'
  return undefined
})

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化字节大小
const formatBytes = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 开始更新
const handleUpdate = async (background: boolean = false) => {
  if (!updateInfo.value.canDownload) {
    errorMessage.value = '当前版本不支持自动更新，请手动下载安装'
    return
  }

  isBackgroundDownload.value = background
  backgroundDownloadMode.value = background
  startingDownload.value = true

  try {
    await (globalThis as any).electron.startDownloadUpdate()
    downloading.value = true

    // 如果是后台更新，3秒后自动最小化
    if (background) {
      setTimeout(() => {
        if (downloading.value && downloadProgress.value.percent < 100) {
          minimizeDialog()
        }
      }, 3000)
    }
  } catch (error: any) {
    errorMessage.value = `启动下载失败: ${error.message}`
  } finally {
    startingDownload.value = false
  }
}

// 稍后提醒（本次会话不再提示，重启后继续提示）
const handleIgnoreThisTime = () => {
  if (!updateInfo.value.version) return

  try {
    // 使用 sessionStorage 保存（仅在当前会话有效，关闭应用后清除）
    const ignoredThisSession = getIgnoredThisSession()
    if (!ignoredThisSession.includes(updateInfo.value.version)) {
      ignoredThisSession.push(updateInfo.value.version)
      sessionStorage.setItem('electron-ignored-this-session', JSON.stringify(ignoredThisSession))
    }

    $baseMessage('已推迟更新，下次启动时会继续提醒', 'success', 'hey')
    show.value = false
  } catch (error: any) {
    console.error('保存推迟状态失败:', error)
  }
}

// 获取本次会话中被推迟的版本列表
const getIgnoredThisSession = (): string[] => {
  try {
    const stored = sessionStorage.getItem('electron-ignored-this-session')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// 检查版本是否在本次会话中被推迟
const isVersionIgnored = (version: string): boolean => {
  const ignoredThisSession = getIgnoredThisSession()
  return ignoredThisSession.includes(version)
}

// 最小化对话框（后台下载）
const minimizeDialog = () => {
  show.value = false
  $baseMessage('更新正在后台下载中...', 'info', 'hey')
}

// 监听更新可用
let unsubscribeUpdateAvailable: Function
// 监听下载进度
let unsubscribeDownloadProgress: Function
// 监听更新错误
let unsubscribeUpdateError: Function

onMounted(() => {
  console.log('🚀 ElectronUpdate 组件已挂载')
  console.log('🔍 检查 electron API:', !!(globalThis as any).electron)
  console.log('🔍 检查 onUpdateAvailable:', !!(globalThis as any).electron?.onUpdateAvailable)
  console.log('📋 本次会话已推迟的版本:', getIgnoredThisSession())

  // 监听更新通知
  if ((globalThis as any).electron?.onUpdateAvailable) {
    console.log('✅ 开始监听更新通知...')

    // 通知主进程：渲染进程已准备好接收更新通知
    if ((globalThis as any).electron?.notifyRendererReady) {
      ;(globalThis as any).electron.notifyRendererReady()
      console.log('📤 已通知主进程：渲染进程准备就绪')
    }

    unsubscribeUpdateAvailable = (globalThis as any).electron.onUpdateAvailable((data: UpdateInfo) => {
      console.log('📢 [渲染进程] 收到更新通知:', data)
      console.log('📋 本次会话已推迟的版本:', getIgnoredThisSession())

      // 检查版本是否在本次会话中被推迟
      if (isVersionIgnored(data.version)) {
        console.warn(`⚠️ 版本 ${data.version} 在本次会话中已被推迟，不显示更新提示`)
        console.log('💡 重启应用后会继续提示更新')
        return
      }

      console.log('✅ 准备显示更新弹窗...')
      updateInfo.value = data
      show.value = true
      downloading.value = false
      errorMessage.value = ''
      isBackgroundDownload.value = false
      backgroundDownloadMode.value = false
      console.log('✅ 更新弹窗已设置为显示状态, show.value =', show.value)
    })
  } else {
    console.error('❌ electron.onUpdateAvailable 不可用，可能不在 Electron 环境中')
  }

  // 监听下载进度
  unsubscribeDownloadProgress = (globalThis as any).electron.onUpdateDownloadProgress((data: DownloadProgress) => {
    console.log('下载进度:', data)
    downloadProgress.value = data
  })

  // 监听更新错误
  unsubscribeUpdateError = (globalThis as any).electron.onUpdateError((data: { message: string }) => {
    console.error('更新错误:', data)
    errorMessage.value = `更新失败: ${data.message}`
    downloading.value = false
    startingDownload.value = false
  })
})

onBeforeUnmount(() => {
  if (unsubscribeUpdateAvailable) unsubscribeUpdateAvailable()
  if (unsubscribeDownloadProgress) unsubscribeDownloadProgress()
  if (unsubscribeUpdateError) unsubscribeUpdateError()
})
</script>

<style lang="scss" scoped>
.electron-update {
  position: relative;

  &-icon {
    position: absolute;
    top: -50px;
    left: 50%;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    background: linear-gradient(1deg, var(--el-color-primary-light-1), var(--el-color-primary));
    border-radius: 50%;
    transform: translateX(-50%);

    i {
      font-size: 50px;
      color: var(--el-color-white);
    }
  }

  &-cup {
    position: absolute;
    right: 20px;
    bottom: 70px;
    font-size: 80px;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(var(--el-color-primary-light-7), var(--el-color-primary-light-9));
    background-clip: text;
  }

  h3 {
    margin: 10px 0;
    font-size: 20px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  .update-date {
    margin-bottom: 15px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .release-notes {
    max-height: 300px;
    padding: 15px;
    margin: 15px 0;
    overflow-y: auto;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    h4 {
      margin: 0 0 10px;
      font-size: 15px;
      font-weight: bold;
      color: var(--el-text-color-primary);
    }

    pre {
      margin: 0;
      font-size: 13px;
      line-height: 1.8;
      color: var(--el-text-color-regular);
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .download-progress {
    margin: 20px 0;

    .progress-text {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }
  }

  .update-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;

    .el-button {
      width: 200px;
    }
  }

  .downloading-tip {
    padding: 10px;
    font-size: 13px;
    color: var(--el-color-info);
    text-align: center;

    p {
      margin-bottom: 10px;
    }
  }

  .error-message {
    text-align: center;

    p {
      margin-bottom: 15px;
      color: var(--el-color-error);
    }
  }
}
</style>

<style lang="scss">
.electron-update {
  &.el-dialog {
    margin-top: 20vh !important;
    border-radius: 15px;

    .el-dialog__body {
      padding: 30px 40px;
    }

    .el-dialog__footer {
      text-align: center !important;
      padding: 0 40px 30px;

      .el-button {
        min-width: 200px;
        border-radius: 20px;
      }
    }
  }
}
</style>
