<template>
  <el-dialog v-model="dialogVisible" title="活动商品调整" width="600px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <!-- 折扣方式 -->
      <el-form-item label="折扣方式" prop="DiscountType">
        <el-select v-model="form.DiscountType" placeholder="请选择折扣方式">
          <el-option v-for="(label, key) in discountTypeOptions" :key="key" :label="label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <!-- 调整方式 -->
      <el-form-item label="调整方式" prop="AdjustType">
        <el-radio-group v-model="form.AdjustType">
          <el-radio v-for="(label, key) in adjustTypeOptions" :key="key" :label="Number(key)">{{ label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 折扣价/折扣率 -->
      <el-form-item v-if="form.DiscountType === FoodManageApi.DiscountTypeEnum.折扣价" label="折扣价" prop="DiscountPrice">
        <el-input-number v-model="form.DiscountPrice"
          :min="form.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动 ? -999999 : 0.01" :max="999999" :precision="2"
          placeholder="请输入折扣价" style="width: 100%" @change="() => formRef?.validateField('DiscountPrice')">
          <template #prefix v-if="form.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动">
            <span>{{ form.DiscountPrice && form.DiscountPrice > 0 ? '上浮' : '下浮' }}</span>
          </template>
          <template #suffix>
            <span>元</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item v-if="form.DiscountType === FoodManageApi.DiscountTypeEnum.折扣率" label="折扣率(折)" prop="DiscountRate">
        <el-input-number v-model="form.DiscountRate"
          :min="form.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动 ? -10 : 0" :max="10" :step="0.01" :precision="2"
          placeholder="请输入折扣率" style="width: 100%" @change="() => formRef?.validateField('DiscountRate')">
          <template #prefix>
            <span v-if="form.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动">
              {{ form.DiscountRate && form.DiscountRate > 0 ? '上浮' : '下浮' }}
            </span>
            <span v-else>指定折扣率</span>
          </template>
          <template #suffix>
            <span>折</span>
          </template>
        </el-input-number>
      </el-form-item>
      <!-- 每日库存限购 -->
      <el-form-item label="每日库存限购" prop="DailyStockLimitType">
        <el-select v-model="form.DailyStockLimitType" placeholder="请选择">
          <el-option v-for="(label, key) in limitTypeOptions" :key="key" :label="label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.DailyStockLimitType === FoodManageApi.LimitTypeEnum.限购" label="限购数量"
        prop="DailyStockLimitCount">
        <el-input-number v-model="form.DailyStockLimitCount" :min="1" placeholder="请输入限购数量" style="width: 100%"
          @change="() => formRef?.validateField('DailyStockLimitCount')" />
      </el-form-item>
      <!-- 每单限购 -->
      <el-form-item label="每单限购" prop="OrderLimitType">
        <el-select v-model="form.OrderLimitType" placeholder="请选择">
          <el-option v-for="(label, key) in limitTypeOptions" :key="key" :label="label" :value="Number(key)" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.OrderLimitType === FoodManageApi.LimitTypeEnum.限购" label="限购数量" prop="OrderLimitCount">
        <el-input-number v-model="form.OrderLimitCount" :min="1" placeholder="请输入限购数量" style="width: 100%"
          @change="() => formRef?.validateField('OrderLimitCount')" />
      </el-form-item>
      <!-- 活动名称 -->
      <el-form-item label="活动名称" prop="ActivityName">
        <el-input v-model="form.ActivityName" maxlength="50" placeholder="请输入活动名称"
          @input="() => formRef?.validateField('ActivityName')" />
      </el-form-item>
      <!-- 活动时间 -->
      <el-form-item label="活动时间" required>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <!-- 取整方式 -->
      <el-form-item label="取整方式" prop="RoundType">
        <el-radio-group v-model="form.RoundType">
          <el-radio v-for="(label, key) in roundTypeOptions" :key="key" :label="Number(key)">{{ label }}</el-radio>
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
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { FoodManageApi } from '../../types/api'

const props = defineProps<{
  modelValue: boolean
  selectedCount: number
  targets?: FoodManageApi.UpdateSpuInSkuItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: FoodManageApi.BatchUpdateDiscountParams): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const formRef = ref<FormInstance>()
const form = ref<FoodManageApi.BatchUpdateDiscountParams>({
  SyncSite: false,
  GroupOffids: null,
  TaskId: '',
  ShopId: '',
  DiscountType: FoodManageApi.DiscountTypeEnum.折扣价,
  AdjustType: FoodManageApi.AdjustTypeEnum.上下浮动,
  DiscountPrice: undefined,
  DiscountRate: undefined,
  DailyStockLimitType: FoodManageApi.LimitTypeEnum.不限,
  DailyStockLimitCount: undefined,
  OrderLimitType: FoodManageApi.LimitTypeEnum.不限,
  OrderLimitCount: undefined,
  ActivityName: `活动名称-${new Date().toISOString().split('T')[0]}`,
  StartTime: new Date().toISOString().split('T')[0],
  EndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  RoundType: FoodManageApi.RoundTypeEnum.不改变,
})

const today = new Date().toISOString().split('T')[0]
const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const dateRange = ref<[string, string]>([today, thirtyDaysLater])

watch(dateRange, (val) => {
  if (val) {
    form.value.StartTime = val[0]
    form.value.EndTime = val[1]
  } else {
    form.value.StartTime = ''
    form.value.EndTime = ''
  }
})

watch(
  () => dialogVisible.value,
  (val) => {
    if (val) {
      // 打开时重置表单
      formRef.value?.resetFields()
      dateRange.value = form.value.StartTime && form.value.EndTime ? [form.value.StartTime, form.value.EndTime] : ['', '']
    }
  }
)

watch(
  () => form.value.DiscountPrice,
  () => {
    formRef.value?.validateField('DiscountPrice')
  }
)

watch(
  () => form.value.DiscountRate,
  () => {
    formRef.value?.validateField('DiscountRate')
  }
)

watch(
  () => form.value.DailyStockLimitCount,
  () => {
    formRef.value?.validateField('DailyStockLimitCount')
  }
)

watch(
  () => form.value.OrderLimitCount,
  () => {
    formRef.value?.validateField('OrderLimitCount')
  }
)

watch(
  () => form.value.ActivityName,
  () => {
    formRef.value?.validateField('ActivityName')
  }
)

const discountTypeOptions = {
  [FoodManageApi.DiscountTypeEnum.折扣价]: '折扣价',
  [FoodManageApi.DiscountTypeEnum.折扣率]: '折扣率',
}
const adjustTypeOptions = computed(() => ({
  [FoodManageApi.AdjustTypeEnum.上下浮动]: '上下浮动',
  [FoodManageApi.AdjustTypeEnum.一口价]: form.value.DiscountType === FoodManageApi.DiscountTypeEnum.折扣率 ? '指定折扣率' : '一口价',
}))
const limitTypeOptions = {
  [FoodManageApi.LimitTypeEnum.不限]: '不限',
  [FoodManageApi.LimitTypeEnum.限购]: '限购',
}
const roundTypeOptions = {
  [FoodManageApi.RoundTypeEnum.不改变]: '不改变',
  [FoodManageApi.RoundTypeEnum.向上取整]: '向上取整',
  [FoodManageApi.RoundTypeEnum.向下取整]: '向下取整',
}

const rules = {
  DiscountType: [{ required: true, message: '请选择折扣方式', trigger: 'change' }],
  AdjustType: [{ required: true, message: '请选择调整方式', trigger: 'change' }],
  DiscountPrice: [
    {
      required: form.value.DiscountType === FoodManageApi.DiscountTypeEnum.折扣价,
      message: '请输入折扣价',
      trigger: 'input',
    },
    {
      validator: (rule: any, value: number, callback: any) => {
        if (form.value.DiscountType === FoodManageApi.DiscountTypeEnum.折扣价) {
          if (form.value.AdjustType === FoodManageApi.AdjustTypeEnum.一口价 && value <= 0) {
            callback(new Error('一口价必须大于0'))
          } else if (form.value.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动 && value === 0) {
            callback(new Error('上下浮动不能为0'))
          }
        }
        callback()
      },
      trigger: 'input'
    }
  ],
  DiscountRate: [
    {
      required: form.value.DiscountType === FoodManageApi.DiscountTypeEnum.折扣率,
      message: '请输入折扣率',
      trigger: 'input',
    },
    {
      validator: (rule: any, value: number, callback: any) => {
        if (form.value.DiscountType === FoodManageApi.DiscountTypeEnum.折扣率) {
          if (form.value.AdjustType === FoodManageApi.AdjustTypeEnum.一口价 && value <= 0) {
            callback(new Error('指定折扣率必须大于0'))
          } else if (form.value.AdjustType === FoodManageApi.AdjustTypeEnum.上下浮动 && value === 0) {
            callback(new Error('上下浮动不能为0'))
          }
        }
        callback()
      },
      trigger: 'input'
    }
  ],
  DailyStockLimitType: [{ required: true, message: '请选择每日库存限购类型', trigger: 'change' }],
  DailyStockLimitCount: [
    {
      required: form.value.DailyStockLimitType === FoodManageApi.LimitTypeEnum.限购,
      message: '请输入每日库存限购数量',
      trigger: 'input',
    },
  ],
  OrderLimitType: [{ required: true, message: '请选择每单限购类型', trigger: 'change' }],
  OrderLimitCount: [
    {
      required: form.value.OrderLimitType === FoodManageApi.LimitTypeEnum.限购,
      message: '请输入每单限购数量',
      trigger: 'input',
    },
  ],
  ActivityName: [{ required: true, message: '请输入活动名称', trigger: 'input' }],
  RoundType: [{ required: true, message: '请选择取整方式', trigger: 'change' }],
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...form.value, Targets: props.targets })
      handleClose()
    }
  })
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}
</style>