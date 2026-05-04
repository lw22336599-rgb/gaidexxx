<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="batch-select-content">
      <div class="import-section">
        <div class="import-tip">每行一个门店编号，最多200个</div>
        <div class="import-row">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="4"
            placeholder="请输入门店编号，每行一个"
            class="import-textarea"
          />
          <el-button type="primary" :loading="loading" @click="handleFetchShops">加载门店</el-button>
        </div>
      </div>
      <div v-if="shopList.length > 0" class="shop-list-section">
        <div class="list-header">待操作店铺（共 {{ shopList.length }} 家）</div>
        <el-table :data="shopList" max-height="240" size="small" border>
          <el-table-column prop="name" label="门店名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="office_id" label="门店ID" width="100" />
          <el-table-column prop="city" label="城市" width="100" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="shopList.length === 0" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab'
import type { ShopList_ResulItem_Extra } from '@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem_Extra'

const props = defineProps<{
  modelValue: boolean
  shopType: ShopType
  functionCode?: string
  actionTitle?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [shops: ShopList_ResulItem_Extra[]]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const dialogTitle = computed(() => (props.actionTitle ? `${props.actionTitle} - 选择店铺` : '选择要操作的店铺'))

const inputText = ref('')
const loading = ref(false)
const shopList = ref<ShopList_ResulItem_Extra[]>([])

watch(
  () => props.modelValue,
  val => {
    if (val) {
      inputText.value = ''
      shopList.value = []
    }
  }
)

const handleClose = () => {
  visible.value = false
}

const parseOfficeIds = (text: string): string[] => {
  const ids = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
  return [...new Set(ids)]
}

const MAX_IMPORT_COUNT = 200

const handleFetchShops = async () => {
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
    const shops = res.Shops ?? []
    const byId = new Map<string, (typeof shops)[0]>()
    shops.forEach(s => {
      const id = s.id ?? (s as { shop?: string }).shop ?? ''
      if (id) byId.set(id, s)
    })
    shopList.value = Array.from(byId.values())
    if ((res.NotFoundOfficeIds?.length ?? 0) > 0) {
      gp.$baseMessage(`以下门店未找到：${(res.NotFoundOfficeIds ?? []).join(', ')}`, 'warning', 'hey')
    }
  } catch (error: unknown) {
    gp.$baseMessage((error as { message?: string })?.message || '获取店铺信息失败', 'error', 'hey')
  } finally {
    loading.value = false
  }
}

const handleConfirm = () => {
  if (shopList.value.length === 0) return
  if (shopList.value.length > MAX_IMPORT_COUNT) {
    gp.$baseMessage(`单次最多支持${MAX_IMPORT_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  emit('confirm', shopList.value)
  handleClose()
}
</script>

<style scoped lang="scss">
.batch-select-content {
  .import-section {
    margin-bottom: 16px;

    .import-tip {
      margin-bottom: 8px;
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }

    .import-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;

      .import-textarea {
        flex: 1;
      }

      .el-button {
        flex-shrink: 0;
      }
    }
  }

  .shop-list-section {
    .list-header {
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
}
</style>
