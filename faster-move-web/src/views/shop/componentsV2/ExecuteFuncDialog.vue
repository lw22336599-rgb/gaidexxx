<template>
  <el-dialog
    v-model="visible"
    :title="`执行功能 - ${functionName}`"
    width="1000px"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="execute-func-container">
      <!-- 已选店铺列表（可折叠，支持移除） -->
      <el-card class="shop-section-card" shadow="hover">
        <template #header>
          <div class="shop-section-header" @click="shopListExpanded = !shopListExpanded">
            <div class="header-left">
              <div class="section-title-row">
                <h4>已选店铺</h4>
                <el-button type="primary" size="small" @click.stop="importShopsDialogVisible = true"
                  >导入门店</el-button
                >
              </div>
              <span class="shop-count">{{ displayShops.length }} 家</span>
            </div>
            <el-icon class="collapse-arrow" :class="{ 'is-expanded': shopListExpanded }">
              <ArrowRight />
            </el-icon>
          </div>
        </template>
        <el-collapse-transition>
          <div v-show="shopListExpanded" class="shop-list-body">
            <el-table :data="displayShops" border size="small" max-height="200">
              <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                  <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="门店ID" prop="office_id" width="120">
                <template #default="{ row }">
                  <span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="到期时间" width="90">
                <template #default="{ row }">
                  <span :class="{ 'expired-text': isExpiredForDisplay(row) }">{{ getFunctionEndTime(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="" width="60" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" :icon="Delete" @click="removeShop($index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-transition>
      </el-card>

      <!-- 参数配置 -->
      <div v-if="schemaLoading" v-loading="true" style="min-height: 120px" />
      <template v-else>
        <div v-if="!hasSchema" class="no-params-tip">
          <el-icon style="margin-right: 4px">
            <Check />
          </el-icon>
          该功能无需配置参数，直接执行即可
        </div>
        <template v-else>
          <div class="param-section">
            <div class="section-header">
              <h4>参数配置</h4>
            </div>
            <CategoryAttrConfigPanel
              v-if="functionCode === 'CTGYPRTYMG'"
              :shop-type="shopType"
              :shop-list="selectedShopsForPanel"
              :first-shop-id="displayShops[0]?.id ?? ''"
              :default-conf="defaultConf as any"
              :shop-conf-map="shopConfMap"
            />
            <FuncConfSchemaForm
              v-else-if="schemaResult"
              :schema="schemaResult"
              :default-conf="defaultConf"
              :shop-list="displayShops.map(s => ({ id: s.id, name: s.name }))"
              :get-shop-conf="getShopConf"
              :group-options="groupOptions"
              :group-options-loading="groupOptionsLoading"
              :get-shop-group-options="getShopGroupOptions"
              :get-shop-group-options-loading="getShopGroupOptionsLoading"
              :on-ensure-default-group-options="onEnsureDefaultGroupOptions"
              :on-ensure-group-options="ensureGroupOptions"
              :demo-mode="demoMode"
            />
          </div>
        </template>
      </template>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" :disabled="displayShops.length === 0" @click="handleConfirm">
        执行 ({{ displayShops.length }})
      </el-button>
    </template>

    <!-- 导入门店弹窗 -->
    <ImportShopsByOfficeIdsDialog
      v-model="importShopsDialogVisible"
      :shop-type="shopType"
      :function-code="functionCode"
      @confirm="onImportShopsConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, ArrowRight, Delete } from '@element-plus/icons-vue'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import { apiManager } from '@/TsModel/Api/ApiManager'
import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { TriggerFuncRunParm } from '@/TsModel/Alien/Controllers/Function/TriggerFuncRunParm'
import { ShopConfValue } from '@/TsModel/Alien/Controllers/Function/ShopConfValue'
import type { FuncConfSchemaResult } from '@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult'
import { gp } from '/@vab/plugins/vab'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import CategoryAttrConfigPanel from './CategoryAttrConfigPanel.vue'
import FuncConfSchemaForm from './FuncConfSchemaForm.vue'
import ImportShopsByOfficeIdsDialog from './ImportShopsByOfficeIdsDialog.vue'
import { getParsedProperties, initDefaultConfFromSchema } from './useFuncConfSchema'

const props = defineProps<{
  modelValue: boolean
  shopType: ShopType
  functionCode: string
  functionName: string
  shopList: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 展示的店铺列表（过滤过期、offid 去重后的已选店铺，可移除）
const displayShops = ref<any[]>([])
const shopListExpanded = ref(true)
const importShopsDialogVisible = ref(false)

const onImportShopsConfirm = async (shops: any[], notFoundOfficeIds: string[]) => {
  displayShops.value = shops
  if (notFoundOfficeIds.length > 0) {
    gp.$baseMessage(`以下门店未找到：${notFoundOfficeIds.join(', ')}`, 'warning', 'hey')
  }
  if (shops.length > 0) {
    if (!schemaResult.value) {
      await loadSchema()
    } else {
      await refreshGroupOptionsForShops(shops)
    }
  }
}
const schemaLoading = ref(false)
const submitLoading = ref(false)

const schemaResult = ref<FuncConfSchemaResult | null>(null)

const hasSchema = computed(
  () =>
    props.functionCode === 'CTGYPRTYMG' ||
    (schemaResult.value != null && Object.keys(getParsedProperties(schemaResult.value)).length > 0)
)

const onEnsureDefaultGroupOptions = () => {
  if (displayShops.value.length > 0) ensureGroupOptions(displayShops.value[0].id)
}

const selectedShopsForPanel = computed(() => displayShops.value)

const defaultConf = ref<Record<string, any>>({})
const shopConfMap = ref<Record<string, Record<string, any>>>({})
const groupOptions = ref<FoodGroupItem[]>([])
const groupOptionsLoading = ref(false)
const shopGroupOptionsMap = ref<Record<string, FoodGroupItem[]>>({})
const shopGroupLoadingMap = ref<Record<string, boolean>>({})

function flattenGroupTree(items: FoodGroupItem[] | FoodGroupItem | null | undefined): FoodGroupItem[] {
  const list: FoodGroupItem[] = []
  const walk = (nodes: FoodGroupItem[] | FoodGroupItem | null | undefined) => {
    if (Array.isArray(nodes)) nodes.forEach(walk)
    else if (nodes) {
      list.push(nodes)
      walk(nodes.Children)
    }
  }
  walk(items)
  return list
}

async function fetchGroupsForShop(shopId: string): Promise<FoodGroupItem[]> {
  try {
    const raw = await apiManager.funcRunTaskApi.GetShopGroups(shopId)
    return flattenGroupTree(raw)
  } catch {
    return []
  }
}

async function ensureGroupOptions(shopId: string) {
  if (shopGroupOptionsMap.value[shopId]) return
  shopGroupLoadingMap.value[shopId] = true
  try {
    shopGroupOptionsMap.value[shopId] = await fetchGroupsForShop(shopId)
  } finally {
    shopGroupLoadingMap.value[shopId] = false
  }
}

const getShopGroupOptions = (shopId: string): FoodGroupItem[] => shopGroupOptionsMap.value[shopId] ?? []
const getShopGroupOptionsLoading = (shopId: string): boolean => !!shopGroupLoadingMap.value[shopId]

const getShopConf = (shopId: string): Record<string, any> => {
  if (!shopConfMap.value[shopId]) shopConfMap.value[shopId] = {}
  return shopConfMap.value[shopId]
}

/** 当有店铺时，为 schema 中 x-fetchShopGroups 的字段拉取分组选项（导入门店后调用） */
const refreshGroupOptionsForShops = async (shops: any[]) => {
  if (shops.length === 0 || props.functionCode === 'CTGYPRTYMG') return
  const props_ = getParsedProperties(schemaResult.value)
  const hasFetchShopGroups = Object.values(props_).some((f: any) => f['x-fetchShopGroups'])
  if (!hasFetchShopGroups) return
  groupOptionsLoading.value = true
  try {
    groupOptions.value = await fetchGroupsForShop(shops[0].id)
    for (const shop of shops) {
      ensureGroupOptions(shop.id)
    }
  } finally {
    groupOptionsLoading.value = false
  }
}

const loadSchema = async () => {
  if (!props.functionCode) return
  schemaLoading.value = true
  schemaResult.value = null
  defaultConf.value = {}
  shopConfMap.value = {}
  groupOptions.value = []
  shopGroupOptionsMap.value = {}
  try {
    if (props.functionCode === 'CTGYPRTYMG') {
      defaultConf.value = { GroupOffIds: [], PrttyValues: {} }
      return
    }
    const schemaStr = await apiManager.funcRunTaskApi.GetFuncConfSchema(props.shopType, props.functionCode)
    if (schemaStr) {
      schemaResult.value = { FuncCode: props.functionCode, ConfSchema: schemaStr, AutoRenewRun: false }
      initDefaultConfFromSchema(schemaResult.value, defaultConf.value)
      const props_ = getParsedProperties(schemaResult.value)
      const hasFetchShopGroups = Object.values(props_).some((f: any) => f['x-fetchShopGroups'])
      if (hasFetchShopGroups && displayShops.value.length > 0) {
        await refreshGroupOptionsForShops(displayShops.value)
      }
    }
  } catch {
    schemaResult.value = null
  } finally {
    schemaLoading.value = false
  }
}

// ---------- 到期时间显示（与批量续费一致）----------
const getFunctionEndTime = (shop: any): string => {
  if (!props.functionCode) return '未开通'
  let funcInfo: any
  if (shop.extra_data?.func_enable && Array.isArray(shop.extra_data.func_enable)) {
    const matched = shop.extra_data.func_enable.filter((item: any) => item.code === props.functionCode)
    if (matched.length > 0) {
      funcInfo = matched.reduce((latest: any, current: any) => {
        if (!latest.end_time) return current
        if (!current.end_time) return latest
        return new Date(current.end_time) > new Date(latest.end_time) ? current : latest
      })
    }
  } else if (shop.func_info && Array.isArray(shop.func_info)) {
    funcInfo = shop.func_info.find((item: any) => item.code === props.functionCode)
  } else {
    return '未开通'
  }
  if (!funcInfo?.end_time) return '未开通'
  try {
    const diff = Math.ceil((new Date(funcInfo.end_time).getTime() - Date.now()) / 86400000)
    if (diff < 0) return '已到期'
    if (diff === 0) return '今天到期'
    return `剩余${diff}天`
  } catch {
    return funcInfo.end_time
  }
}

const isExpiredForDisplay = (shop: any): boolean => {
  const t = getFunctionEndTime(shop)
  return t === '未开通' || t === '已到期'
}

/** 判断店铺该功能是否已过期 */
const isShopFuncExpired = (shop: any): boolean => {
  if (!props.functionCode) return true
  let funcInfo: any
  if (shop.extra_data?.func_enable && Array.isArray(shop.extra_data.func_enable)) {
    const matched = shop.extra_data.func_enable.filter((item: any) => item.code === props.functionCode)
    if (matched.length > 0) {
      funcInfo = matched.reduce((a: any, b: any) =>
        !a?.end_time ? b : !b?.end_time ? a : new Date(b.end_time) > new Date(a.end_time) ? b : a
      )
    }
  } else if (shop.func_info && Array.isArray(shop.func_info)) {
    funcInfo = shop.func_info.find((item: any) => item.code === props.functionCode)
  }
  if (!funcInfo?.end_time) return true
  try {
    return new Date(funcInfo.end_time).getTime() < Date.now()
  } catch {
    return true
  }
}

/** 根据 shopList 初始化：过滤过期、按 office_id 去重 */
const initDisplayShops = () => {
  const list = props.shopList ?? []
  const seen = new Set<string>()
  displayShops.value = list.filter(shop => {
    const offId = shop.office_id ?? shop.off_id ?? ''
    if (!offId || seen.has(offId)) return false
    seen.add(offId)
    return !isShopFuncExpired(shop)
  })
}

const removeShop = (index: number) => {
  displayShops.value.splice(index, 1)
}

const shouldIncludeConfValue = (v: any): boolean => {
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v) && v.length === 0) return false
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
  return true
}

const buildDefaultConfValues = (): Record<string, any> | null => {
  const filtered: Record<string, any> = {}
  for (const [k, v] of Object.entries(defaultConf.value)) {
    if (shouldIncludeConfValue(v)) filtered[k] = v
  }
  return Object.keys(filtered).length > 0 ? filtered : null
}

const buildShopConfValues = (): ShopConfValue[] => {
  const result: ShopConfValue[] = []
  for (const shop of displayShops.value) {
    const conf = shopConfMap.value[shop.id] ?? {}
    const filtered: Record<string, any> = {}
    for (const [k, v] of Object.entries(conf)) {
      if (shouldIncludeConfValue(v)) filtered[k] = v
    }
    if (Object.keys(filtered).length > 0) result.push({ ShopId: shop.id, ConfValues: filtered })
  }
  return result
}

const handleConfirm = async () => {
  if (displayShops.value.length === 0) {
    gp.$baseMessage('请选择要执行的店铺', 'warning', 'hey')
    return
  }
  submitLoading.value = true
  try {
    const parm: TriggerFuncRunParm = {
      func_code: props.functionCode,
      shop_ids: displayShops.value.map(s => s.id),
      default_conf_values: hasSchema.value ? buildDefaultConfValues() : null,
      shop_conf_values: hasSchema.value ? buildShopConfValues() : null
    }
    await apiManager.funcRunTaskApi.TriggerFuncRun(parm)
    gp.$baseMessage(`已成功触发 ${displayShops.value.length} 家店铺的任务`, 'success', 'hey')
    emit('success')
    handleClose()
  } catch (error: any) {
    gp.$baseMessage(error.message || '触发失败', 'error', 'hey')
  } finally {
    submitLoading.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  v => {
    if (v) {
      initDisplayShops()
      loadSchema()
    }
  }
)

watch(
  () => props.shopList,
  () => {
    if (visible.value) initDisplayShops()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.execute-func-container {
  .shop-section-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 20px;
      display: block;
      overflow: visible;
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .param-section {
    margin-bottom: 16px;
  }

  .shop-section-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0 -20px 0 0;
    padding-right: 20px;
    width: calc(100% + 20px);

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .collapse-arrow {
      flex-shrink: 0;
      margin-left: auto;
      transition: transform 0.2s;
      color: var(--el-text-color-secondary);

      &.is-expanded {
        transform: rotate(90deg);
      }
    }
  }

  .shop-list-body {
    margin-top: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .section-title-row {
    display: flex;
    align-items: center;
    gap: 8px;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .shop-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .no-params-tip {
    padding: 16px;
    color: var(--el-color-success);
    font-size: 13px;
    display: flex;
    align-items: center;
  }

  .blur-text {
    filter: blur(4px);
    user-select: none;
  }

  .expired-text {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
