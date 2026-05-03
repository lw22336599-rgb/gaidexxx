<template>
  <el-dialog v-model="dialogVisible" title="修改状态" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="商品状态" prop="IsOnSale">
        <el-radio-group v-model="form.IsOnSale">
          <el-radio :label="FoodManageApi.FoodStatusType.已上架">上架</el-radio>
          <el-radio :label="FoodManageApi.FoodStatusType.已下架">下架</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { FoodManageApi } from '../../types/api'

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: Pick<FoodManageApi.BatchUpdateStatusParams, 'IsOnSale'>): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const form = ref({
  IsOnSale: FoodManageApi.FoodStatusType.已上架, // 使用枚举值
})

const rules = {
  IsOnSale: [{ required: true, message: '请选择商品状态', trigger: 'change' }],
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('UpdateStatusDialog - 发送状态值:', form.value.IsOnSale)
      emit('confirm', {
        IsOnSale: form.value.IsOnSale,
      })
      handleClose()
    }
  })
}
</script>