<template>
  <el-dialog v-model="dialogVisible" title="调整原价" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="修改方式" prop="ChangeType">
        <el-radio-group v-model="form.ChangeType">
          <el-radio :label="FoodManageApi.ChangePriceTypeEnum.上下浮动">上下浮动</el-radio>
          <el-radio :label="FoodManageApi.ChangePriceTypeEnum.固定价格">固定价格</el-radio>
          <el-radio :label="FoodManageApi.ChangePriceTypeEnum.百分比浮动">百分比浮动</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="form.ChangeType === FoodManageApi.ChangePriceTypeEnum.百分比浮动 ? '百分比' : '价格'"
        prop="Value"
      >
        <el-input-number
          v-model="form.Value"
          :min="-999999"
          :precision="2"
          :step="0.1"
          placeholder="请输入价格"
          style="width: 200px"
        >
          <template #suffix>
            <span>{{ form.ChangeType === FoodManageApi.ChangePriceTypeEnum.百分比浮动 ? '%' : '元' }}</span>
          </template>
        </el-input-number>
        <span class="ml-2 text-gray-500">
          {{ form.Value > 0 ? '上调' : form.Value < 0 ? '下调' : '' }}
          {{ form.ChangeType === FoodManageApi.ChangePriceTypeEnum.百分比浮动 ? '百分比' : '价格' }}
        </span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { FoodManageApi } from '../../types/api'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
  shopId: string
  taskId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.UpdateFoodPriceParms): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const initialValue = ref(0)
const form = ref({
  ChangeType: FoodManageApi.ChangePriceTypeEnum.上下浮动,
  Value: 0,
  SyncSite: true,
  GroupOffids: null,
  TaskId: props.taskId,
  ShopId: props.shopId
})

const rules = {
  ChangeType: [{ required: true, message: '请选择修改方式', trigger: 'change' }],
  Value: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (valid) {
      if (form.value.Value === initialValue.value) {
        ElMessage.warning('请修改价格')
        return
      }
      emit('confirm', {
        ChangeType: form.value.ChangeType,
        Value: form.value.Value,
        SyncSite: form.value.SyncSite,
        GroupOffids: form.value.GroupOffids,
        TaskId: form.value.TaskId,
        ShopId: form.value.ShopId
      })
      handleClose()
    }
  })
}

// 监听对话框显示，重置初始值
watch(
  () => dialogVisible.value,
  newVal => {
    if (newVal) {
      initialValue.value = form.value.Value
    }
  }
)
</script>

<style scoped>
.ml-2 {
  margin-left: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}
</style>
