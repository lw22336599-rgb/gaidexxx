<template>
  <el-dialog v-model="dialogVisible" title="设置起购" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="调整方式" prop="AdjustType">
        <el-radio-group v-model="form.AdjustType">
          <el-radio :label="0">上下浮动</el-radio>
          <el-radio :label="1">固定数量</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="起购数量" prop="AdjustMinBuy">
        <el-input-number v-model="form.AdjustMinBuy" :min="1" :precision="0" :step="1" placeholder="请输入起购数量" />
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
import type { FoodManageApi } from '../../types/api'

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
  shopId: string
  taskId: string
  selectedFoods: string[]
  selectedSkus: FoodManageApi.UpdateSpuInSkuItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.BatchUpdateMinBuyParams): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const form = ref({
  AdjustType: 0,
  AdjustMinBuy: 1,
})

const rules = {
  AdjustType: [{ required: true, message: '请选择调整方式', trigger: 'change' }],
  AdjustMinBuy: [{ required: true, message: '请输入起购数量', trigger: 'blur' }],
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // 优先使用 selectedSkus，如果没有则使用 selectedFoods
      const targets = props.selectedSkus.length > 0
        ? props.selectedSkus
        : props.selectedFoods.map(spu => ({
          Spu: spu,
          SkuIds: []
        }))

      emit('confirm', {
        AdjustType: form.value.AdjustType,
        AdjustMinBuy: form.value.AdjustMinBuy,
        SyncSite: true,
        GroupOffids: null,
        TaskId: props.taskId,
        ShopId: props.shopId,
        Targets: targets
      })
      handleClose()
    }
  })
}
</script>