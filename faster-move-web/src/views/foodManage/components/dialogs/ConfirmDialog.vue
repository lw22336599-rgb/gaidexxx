<template>
  <el-dialog v-model="dialogVisible" :title="title" width="400px" :close-on-click-modal="false">
    <div class="confirm-dialog">
      <p v-html="processedContent"></p>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  modelValue: boolean
  title: string
  content: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 处理内容，将换行符转换为 HTML 标签
const processedContent = computed(() => {
  // 1. 将内容按换行符分割
  const lines = props.content.split('\n')

  // 2. 处理每一行，将空行转换为 <br>，非空行转换为 <p>
  const processedLines = lines.map(line => {
    if (line.trim() === '') {
      return '<br>'
    }
    return `<p>${line}</p>`
  })

  // 3. 使用 DOMPurify 净化 HTML
  return DOMPurify.sanitize(processedLines.join(''))
})

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  padding: 20px 0;
  text-align: center;

  :deep(p) {
    margin: 0;
    line-height: 1.5;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>