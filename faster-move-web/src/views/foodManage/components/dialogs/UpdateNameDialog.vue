<template>
  <el-dialog
    v-model="dialogVisible"
    title="调整商品名"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="修改方式" prop="Mode">
        <el-radio-group v-model="form.Mode">
          <el-radio :label="1">添加前缀</el-radio>
          <el-radio :label="2">添加后缀</el-radio>
          <el-radio :label="3">替换文本</el-radio>
          <el-radio :label="4">设置名称</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="form.Mode === 1">
        <el-form-item label="添加前缀" prop="Prefix">
          <el-input v-model="form.Prefix" placeholder="请输入要添加的前缀" />
        </el-form-item>
      </template>
      <template v-if="form.Mode === 2">
        <el-form-item label="添加后缀" prop="Suffix">
          <el-input v-model="form.Suffix" placeholder="请输入要添加的后缀" />
        </el-form-item>
      </template>
      <template v-if="form.Mode === 3">
        <el-form-item label="原文本" prop="OriginalText">
          <el-input v-model="form.OriginalText" placeholder="请输入要替换的文本" />
        </el-form-item>
        <el-form-item label="新文本" prop="ReplacementText">
          <el-input v-model="form.ReplacementText" placeholder="请输入替换后的文本" />
        </el-form-item>
      </template>
      <template v-if="form.Mode === 4">
        <el-form-item label="新名称" prop="ReplacementText">
          <el-input v-model="form.ReplacementText" placeholder="请输入新的商品名称" />
        </el-form-item>
      </template>
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', params: Partial<FoodManageApi.UpdateFoodNameParms>): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const form = ref<Partial<FoodManageApi.UpdateFoodNameParms>>({
  Mode: 1,
  Prefix: '',
  Suffix: '',
  OriginalText: '',
  ReplacementText: ''
})

const rules = {
  Mode: [{ required: true, message: '请选择修改方式', trigger: 'change' }],
  Prefix: [{ required: true, message: '请输入前缀', trigger: 'blur' }],
  Suffix: [{ required: true, message: '请输入后缀', trigger: 'blur' }],
  OriginalText: [{ required: true, message: '请输入原文本', trigger: 'blur' }],
  ReplacementText: [
    {
      required: true,
      message: '请输入替换文本',
      trigger: 'blur',
      validator: (rule: any, value: string, callback: any) => {
        if (form.value.Mode === 4 && !value) {
          callback(new Error('请输入新名称'))
        } else {
          callback()
        }
      }
    }
  ]
}

const handleClose = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(valid => {
    if (valid) {
      emit('confirm', form.value)
      handleClose()
    }
  })
}
</script>
