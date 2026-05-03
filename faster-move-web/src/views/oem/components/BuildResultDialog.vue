<template>
  <el-dialog v-model="visible" title="提示" width="550px" class="build-result-dialog">
    <div class="build-result">
      <div class="build-status">
        <el-icon class="success-icon"><Check /></el-icon>
        <span>构建中，请保存下载链接，30分钟后下载</span>
      </div>

      <div class="download-section">
        <!-- <div class="build-result-item">
          <div class="platform-badge">
            <el-icon><Apple /></el-icon>
            <span>macOS</span>
          </div>
          <div class="build-result-item-value">
            <el-tooltip content="点击下载 macOS 安装包" placement="top">
              <el-button type="primary" size="small" @click="downloadFile(result.macFilePath)">
                <el-icon><Download /></el-icon>
                下载 macOS 版本
              </el-button>
            </el-tooltip>
            <div class="file-path">{{ getDownloadUrl(result.macFilePath) }}</div>
          </div>
        </div> -->

        <div class="build-result-item">
          <div class="platform-badge">
            <el-icon><Monitor /></el-icon>
            <span>Windows</span>
          </div>
          <div class="build-result-item-value">
            <el-tooltip content="点击下载 Windows 安装包" placement="top">
              <el-button type="primary" size="small" @click="downloadFile(result.winFilePath)">
                <el-icon><Download /></el-icon>
                下载 Windows 版本
              </el-button>
            </el-tooltip>
            <div class="file-path">{{ getDownloadUrl(result.winFilePath) }}</div>
          </div>
        </div>
      </div>

      <div class="build-note">
        <el-alert type="info" :closable="false">
          <template #title>
            <div>构建信息</div>
          </template>
          <div>构建版本: v{{ result.version }}</div>
          <div>构建时间: {{ result.buildTime }}</div>
          <div>产品名称: {{ result.productName }}</div>
        </el-alert>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" @click="copyLinks">
          <el-icon><CopyDocument /></el-icon>
          复制下载链接
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Check, Apple, Monitor, Download, CopyDocument } from '@element-plus/icons-vue'
import { gp } from '~/library/plugins/vab'

// 定义组件接收的属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  buildResult: {
    type: Object,
    default: () => ({})
  }
})

// 定义组件触发的事件
const emit = defineEmits(['update:modelValue'])

// 内部状态
const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

// 将属性简化为本地变量，方便访问
const result = computed(() => props.buildResult)

// 生成下载URL
const getDownloadUrl = (filePath: string) => {
  return filePath
}

// 关闭对话框
const closeDialog = () => {
  visible.value = false
}

// 下载文件
const downloadFile = (filePath: string) => {
  const url = getDownloadUrl(filePath)
  window.open(url, '_blank')
}

// 复制链接
const copyLinks = () => {
  const macUrl = getDownloadUrl(result.value.macFilePath)
  const winUrl = getDownloadUrl(result.value.winFilePath)
  // const text = `macOS 下载链接: ${macUrl}\nWindows 下载链接: ${winUrl}`
  const text = `Windows 下载链接: ${winUrl}`

  navigator.clipboard
    .writeText(text)
    .then(() => {
      gp.$baseMessage('下载链接已复制到剪贴板', 'success', 'hey')
    })
    .catch(err => {
      gp.$baseMessage('复制失败: ' + err, 'error', 'hey')
    })
}
</script>

<style lang="scss" scoped>
.build-result-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
    padding: 15px 20px;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #ebeef5;
    padding: 15px 20px;
  }

  .build-result {
    .build-status {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .success-icon {
        color: #67c23a;
        background: rgba(103, 194, 58, 0.15);
        border-radius: 50%;
        font-size: 18px;
        padding: 5px;
        margin-right: 10px;
      }
    }

    .download-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .build-result-item {
      display: flex;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px dashed #ebeef5;

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .platform-badge {
        display: flex;
        align-items: center;
        background: #ecf5ff;
        color: #409eff;
        padding: 6px 12px;
        border-radius: 4px;
        margin-right: 16px;
        min-width: 100px;

        .el-icon {
          margin-right: 5px;
        }
      }

      .build-result-item-value {
        flex: 1;

        .file-path {
          color: #909399;
          font-size: 12px;
          margin-top: 8px;
          word-break: break-all;
        }
      }
    }

    .build-note {
      margin-top: 20px;

      :deep(.el-alert__title) {
        font-weight: bold;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
