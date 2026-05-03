<template>
  <el-dialog v-model="dialogVisible" title="批量调整库存" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="调整方式" prop="AdjustType">
        <el-radio-group v-model="form.AdjustType">
          <el-radio :label="AdjustTypeEnumStock.上下浮动">上下浮动</el-radio>
          <el-radio :label="AdjustTypeEnumStock.固定数量">固定数量</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调整库存" prop="AdjustStock">
        <el-input-number v-model="form.AdjustStock" :min="0" :precision="0" :step="1" placeholder="请输入调整库存" />
        <div v-if="adjustStockError" class="error-tip">请输入调整价格</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { FoodManageApi } from '../../types/api'
const { AdjustTypeEnumStock } = FoodManageApi

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.BatchUpdateStockParams): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const form = ref<Pick<FoodManageApi.BatchUpdateStockParams, 'AdjustType' | 'AdjustStock'>>({
  AdjustType: AdjustTypeEnumStock.上下浮动,
  AdjustStock: 0,
})

const rules = {
  AdjustType: [{ required: true, message: '请选择调整方式', trigger: 'change' }],
  AdjustStock: [{ required: true, message: '请输入调整库存', trigger: 'blur' }],
}

const adjustStockError = ref(false)

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
  adjustStockError.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      adjustStockError.value = false
      emit('confirm', {
        AdjustType: form.value.AdjustType,
        AdjustStock: form.value.AdjustStock,
      } as FoodManageApi.BatchUpdateStockParams)
      handleClose()
    } else {
      adjustStockError.value = true
    }
  })
}
</script>

<style scoped>
.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}
</style>