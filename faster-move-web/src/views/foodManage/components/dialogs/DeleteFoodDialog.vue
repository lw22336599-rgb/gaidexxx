<template>
  <el-dialog v-model="dialogVisible" title="删除商品" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="确认删除" prop="confirm">
        <el-checkbox v-model="form.confirm">
          我已确认要删除选中的 {{ selectedCount }} 个商品
        </el-checkbox>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="danger" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import type { FoodManageApi } from '../../types/api'

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.BatchDeleteFoodParams): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const form = ref({
  confirm: false,
})

const rules = {
  confirm: [
    {
      validator: (rule: any, value: boolean, callback: any) => {
        if (!value) {
          callback(new Error('请确认删除操作'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', {
        confirm: form.value.confirm,
      })
      handleClose()
    }
  })
}
</script>