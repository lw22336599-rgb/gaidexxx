<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="480px" :close-on-click-modal="false"
    :before-close="handleClose" destroy-on-close>
    <div class="import-content">
      <div class="import-tip">每行一个门店编号，最多200个</div>
      <el-input v-model="inputText" type="textarea" :rows="10" placeholder="请输入门店编号，每行一个，最多200个"
        class="import-textarea" />
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab'

const SHOP_TYPE_DISPLAY: Record<number, string> = {
  [ShopType.美团]: '美团',
  [ShopType.饿了么]: '饿了么',
  [ShopType.美团闪购]: '美团闪购',
  [ShopType.美团医药]: '美团医药',
  [ShopType.饿百零售]: '饿百零售',
  [ShopType.京东到家]: '京东',
  [ShopType.抖店即时零售]: '抖店',
  [ShopType.饿了么官方]: '饿了么官方',
  [ShopType.美团团购]: '美团团购',
  [ShopType.京东团购]: '京东'
}

const props = defineProps<{
  modelValue: boolean
  shopType: ShopType
  functionCode?: string
  shopTypeStr?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': [shops: any[], notFoundOfficeIds: string[]]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(
  () => `导入${props.shopTypeStr ?? SHOP_TYPE_DISPLAY[props.shopType] ?? '门店'}(会清空已选门店)`
)

const inputText = ref('')
const loading = ref(false)

watch(() => props.modelValue, (val) => {
  if (val) {
    inputText.value = ''
  }
})

const handleClose = () => {
  visible.value = false
}

const parseOfficeIds = (text: string): string[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

const MAX_IMPORT_COUNT = 200

const handleConfirm = async () => {
  const officeIds = parseOfficeIds(inputText.value)
  if (officeIds.length === 0) {
    gp.$baseMessage('请输入至少一个门店编号', 'warning', 'hey')
    return
  }
  if (officeIds.length > MAX_IMPORT_COUNT) {
    gp.$baseMessage(`最多导入${MAX_IMPORT_COUNT}个门店`, 'warning', 'hey')
    return
  }

  loading.value = true
  try {
    const res = await apiManager.shopmgApi.GetShopsByOfficeIds({
      ShopType: props.shopType,
      OfficeIds: officeIds,
      FunctionCode: props.functionCode ?? undefined
    })
    emit('confirm', res.Shops ?? [], res.NotFoundOfficeIds ?? [])
    handleClose()
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取店铺信息失败', 'error', 'hey')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.import-content {
  .import-tip {
    margin-bottom: 8px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .import-textarea {
    width: 100%;
  }
}
</style>