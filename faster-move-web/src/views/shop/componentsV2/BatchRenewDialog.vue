<template>
  <el-dialog v-model="visible" title="批量续费" width="1210px" :before-close="handleClose" destroy-on-close>
    <!-- 上方两列：店铺列表 + 套餐选择/功能说明 -->
    <div class="batch-renew-container">
      <!-- 左侧：店铺列表 -->
      <div class="shop-list-section">
        <div class="section-header">
          <div class="section-title-row">
            <h4>续费店铺列表</h4>
            <el-button type="primary" size="small" @click="importShopsDialogVisible = true">导入门店</el-button>
          </div>
          <div class="shop-count">共 {{ localShopList.length }} 家店铺</div>
        </div>
        <el-table :data="localShopList" height="340px" border>
          <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="130">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" width="90">
            <template #default="{ row }">
              <span :class="{ 'expired-text': isExpired(row) }">{{ getFunctionEndTime(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeShop($index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右侧：仅价格套餐，功能说明移至后方 -->
      <div class="right-section">
        <div class="price-list-section">
          <div class="section-header">
            <h4>选择续费套餐</h4>
          </div>
          <div v-loading="priceLoading" class="price-list-wrapper">
            <div
              v-for="item in priceList"
              :key="item.price_id"
              class="price-card"
              :class="{ selected: selectedPriceId === item.price_id }"
              @click="selectedPriceId = item.price_id"
            >
              <div class="price-card-content">
                <el-radio v-model="selectedPriceId" :label="item.price_id" style="margin-right: 8px">
                  {{ formatPriceLabel(item) }}
                </el-radio>
              </div>
            </div>
            <el-empty v-if="!priceLoading && priceList.length === 0" description="暂无可用套餐" />
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明：移至规格列表后面，避免撑高导致规格显示不全 -->
    <div v-if="displayFunctions.length > 0" class="service-card-section service-card-section-after">
      <div class="section-header">
        <h4>功能说明</h4>
      </div>
      <div class="service-card-list service-card-list-compact">
        <div v-for="fn in displayFunctions" :key="fn.code" class="service-card">
          <div class="service-title">{{ fn.name }}</div>
          <div v-if="getFuncNotes(fn.code)" class="service-desc">{{ getFuncNotes(fn.code) }}</div>
          <div v-else-if="fn.notes" class="service-desc">{{ fn.notes }}</div>
          <div v-else class="service-desc no-notes">暂无说明</div>
        </div>
      </div>
    </div>

    <!-- 下方独占一行：续费后自动执行（可折叠卡片） -->
    <div v-if="hasAutoRunFuncs" v-loading="schemaLoading" class="auto-run-card">
      <div class="auto-run-card-header" @click="autoRunCardExpanded = !autoRunCardExpanded">
        <div class="auto-run-card-title">
          <el-icon class="collapse-arrow" :class="{ 'is-expanded': autoRunCardExpanded }">
            <ArrowRight />
          </el-icon>
          <span>续费后自动执行</span>
          <el-tag size="small" type="success" style="margin-left: 8px">{{ autoRunSchemas.length }} 个功能</el-tag>
        </div>
        <div class="auto-run-card-actions" @click.stop>
          <el-switch v-model="autoRunAfterPay" active-text="开启" inactive-text="关闭" />
        </div>
      </div>

      <el-collapse-transition>
        <div v-show="autoRunCardExpanded" class="auto-run-card-body">
          <div v-if="!autoRunAfterPay" class="auto-run-tip">
            <el-empty description="开启后可为每家店铺配置自动执行参数" :image-size="50" />
          </div>

          <template v-if="autoRunAfterPay">
            <div v-for="schema in autoRunSchemas" :key="schema.FuncCode" class="func-schema-block">
              <div class="func-schema-title">
                <el-tag size="small" type="primary" style="margin-right: 6px">{{
                  getFuncDisplayName(schema.FuncCode)
                }}</el-tag>
                参数配置
              </div>

              <!-- 类目属性批量设置：使用独立配置组件 -->
              <CategoryAttrConfigPanel
                v-if="schema.FuncCode === 'CTGYPRTYMG'"
                :shop-type="props.shopType"
                :shop-list="localShopList"
                :first-shop-id="localShopList[0]?.id ?? ''"
                :default-conf="getDefaultConf(schema.FuncCode)"
                :shop-conf-map="shopConfMap[schema.FuncCode] || {}"
              />

              <div v-else-if="Object.keys(getParsedProperties(schema)).length === 0" class="no-params-tip">
                <el-icon style="margin-right: 4px">
                  <Check />
                </el-icon>
                无需配置参数，续费后将自动执行
              </div>

              <FuncConfSchemaForm
                v-else
                :schema="schema"
                :default-conf="getDefaultConf(schema.FuncCode)"
                :shop-list="localShopList.map(s => ({ id: s.id, name: s.name }))"
                :get-shop-conf="sid => getShopConf(schema.FuncCode, sid)"
                :group-options="groupOptions"
                :group-options-loading="groupOptionsLoading"
                :get-shop-group-options="getShopGroupOptions"
                :get-shop-group-options-loading="getShopGroupOptionsLoading"
                :on-ensure-default-group-options="ensureDefaultGroupOptionsLoaded"
                :on-ensure-group-options="ensureGroupOptions"
                :demo-mode="demoMode"
              />
            </div>
          </template>
        </div>
      </el-collapse-transition>
    </div>

    <div class="total-cost-section">
      <div class="cost-calculation">
        <span>续费店铺：{{ localShopList.length }} 家</span>
        <span v-if="selectedPrice">× 套餐价格：{{ selectedPrice.cost }} 积分/家</span>
        <span class="total-label">= 总计：</span>
        <span class="total-cost">{{ totalCost }} 积分</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="renewLoading" :disabled="!selectedPriceId" @click="handleConfirmRenew">
          确认续费
        </el-button>
      </div>
    </template>

    <!-- 未到期店铺二次确认弹窗 -->
    <el-dialog
      v-model="notExpiredConfirmVisible"
      title="发现未到期店铺"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="not-expired-tip">
        <el-icon class="not-expired-icon">
          <WarningFilled />
        </el-icon>
        <span
          >以下 <b>{{ notExpiredConfirmShops.length }}</b> 家店铺当前尚未到期，是否忽略这些店铺（不续费）？</span
        >
      </div>
      <el-table :data="notExpiredConfirmShops" border size="small" max-height="220px" style="margin-top: 12px">
        <el-table-column label="店铺名称" prop="name" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="门店ID" prop="office_id" width="130">
          <template #default="{ row }">
            <span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前有效期" width="110" align="center">
          <template #default="{ row }">
            <span style="color: var(--el-color-success)">{{ getFunctionEndTime(row) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="handleNotExpiredCancel">取消</el-button>
        <el-button type="warning" @click="handleNotExpiredIgnore">忽略这些店铺（不续费）</el-button>
        <el-button type="primary" @click="handleNotExpiredRenewAll">全部追加续费</el-button>
      </template>
    </el-dialog>

    <!-- 导入门店弹窗 -->
    <ImportShopsByOfficeIdsDialog
      v-model="importShopsDialogVisible"
      :shop-type="props.shopType"
      :function-code="props.functionCode"
      @confirm="onImportShopsConfirm"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, QuestionFilled, ArrowRight, WarningFilled } from '@element-plus/icons-vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { GetFunctionPrices_result_itemV2 } from '@/TsModel/Alien/Controllers/Function/GetFunctionPrices_result_itemV2'
import { FuncConfSchemaResult } from '@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult'
import { BatchPayShopV2_Parm } from '@/TsModel/Alien/Controllers/Function/BatchPayShopV2_Parm'
import { ShopConfValue } from '@/TsModel/Alien/Controllers/Function/ShopConfValue'
import { gp } from '/@vab/plugins/vab'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { getFunctionList } from '@/utils/functionCache'
import { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import CategoryAttrConfigPanel from './CategoryAttrConfigPanel.vue'
import FuncConfSchemaForm from './FuncConfSchemaForm.vue'
import ImportShopsByOfficeIdsDialog from './ImportShopsByOfficeIdsDialog.vue'
import { getParsedProperties, initDefaultConfFromSchema, clearSchemaCache } from './useFuncConfSchema'

const props = defineProps<{
  modelValue: boolean
  shopList: any[]
  shopType: ShopType
  functionCode: string
  functionName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  renewSuccess: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// ---------- 店铺列表 ----------
const localShopList = ref<any[]>([])
const importShopsDialogVisible = ref(false)

const onImportShopsConfirm = (shops: any[], notFoundOfficeIds: string[]) => {
  localShopList.value = shops
  if (notFoundOfficeIds.length > 0) {
    gp.$baseMessage(`以下门店未找到：${notFoundOfficeIds.join(', ')}`, 'warning', 'hey')
  }
}

watch(
  () => props.shopList,
  newList => {
    localShopList.value = [...newList]
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  isVisible => {
    if (isVisible) localShopList.value = [...props.shopList]
  }
)

// ---------- 价格套餐 ----------
const priceList = ref<GetFunctionPrices_result_itemV2[]>([])
const priceLoading = ref(false)
const selectedPriceId = ref('')
const renewLoading = ref(false)

const fullFuncList = ref<t_wmt_function[]>([])

const selectedPrice = computed(() => priceList.value.find(p => p.price_id === selectedPriceId.value))

const totalCost = computed(() => {
  if (!selectedPrice.value) return 0
  return localShopList.value.length * selectedPrice.value.cost
})

const formatPriceLabel = (item: GetFunctionPrices_result_itemV2): string => {
  const name = item.func_name || item.price_notes || '未命名套餐'
  return `${name} - ${item.add_time}天 - ${item.cost}积分`
}

const loadPriceList = async () => {
  if (!props.functionCode || !visible.value) return
  priceLoading.value = true
  try {
    const funcList = await getFunctionList(props.shopType)
    fullFuncList.value = funcList
    const func = funcList.find(f => f.code === props.functionCode)
    const priceTitle = func?.name || props.functionCode
    const result = await apiManager.functionpriceApi.GetFunctionPrices(props.shopType, priceTitle, true)
    priceList.value = result
    if (result.length > 0) {
      selectedPriceId.value = result[0].price_id
      await loadSchemas(result[0])
    }
  } catch (error: any) {
    gp.$baseMessage('获取价格列表失败: ' + (error.message || '未知错误'), 'error', 'hey')
  } finally {
    priceLoading.value = false
  }
}

const getFuncNotes = (code: string): string => {
  return fullFuncList.value.find(f => f.code === code)?.notes ?? ''
}

const displayFunctions = computed(() => {
  const priceFuncs = selectedPrice.value?.functions ?? []
  if (priceFuncs.length > 0) return priceFuncs
  if (!props.functionCode || fullFuncList.value.length === 0) return []
  const found = fullFuncList.value.find(f => f.code === props.functionCode)
  return found ? [found] : []
})

// ---------- Schema 与自动执行 ----------

const schemaLoading = ref(false)
const allSchemaResults = ref<FuncConfSchemaResult[]>([])

const autoRunSchemas = computed<FuncConfSchemaResult[]>(() => allSchemaResults.value.filter(s => s.AutoRenewRun))

const hasAutoRunFuncs = computed(() => autoRunSchemas.value.length > 0)

const autoRunAfterPay = ref(false)
const autoRunCardExpanded = ref(true)

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

const groupOptions = ref<FoodGroupItem[]>([])
const groupOptionsLoading = ref(false)
const shopGroupOptionsMap = ref<Record<string, FoodGroupItem[]>>({})
const shopGroupLoadingMap = ref<Record<string, boolean>>({})

async function ensureGroupOptions(shopId: string) {
  if (shopGroupOptionsMap.value[shopId]) return
  shopGroupLoadingMap.value[shopId] = true
  try {
    shopGroupOptionsMap.value[shopId] = await fetchGroupsForShop(shopId)
  } finally {
    shopGroupLoadingMap.value[shopId] = false
  }
}

async function ensureDefaultGroupOptionsLoaded() {
  if (groupOptions.value.length > 0 || localShopList.value.length === 0) return
  groupOptionsLoading.value = true
  try {
    groupOptions.value = await fetchGroupsForShop(localShopList.value[0].id)
  } finally {
    groupOptionsLoading.value = false
  }
}

const getShopGroupOptions = (shopId: string): FoodGroupItem[] => shopGroupOptionsMap.value[shopId] ?? []
const getShopGroupOptionsLoading = (shopId: string): boolean => !!shopGroupLoadingMap.value[shopId]

const getFuncDisplayName = (code: string): string => {
  const fn = selectedPrice.value?.functions?.find(f => f.code === code)
  return fn?.name ?? code
}

// 按 funcCode 存储默认参数
const defaultConfMap = ref<Record<string, Record<string, any>>>({})
const getDefaultConf = (funcCode: string): Record<string, any> => {
  if (!defaultConfMap.value[funcCode]) defaultConfMap.value[funcCode] = {}
  return defaultConfMap.value[funcCode]
}

// 按 funcCode + shopId 存储各店铺参数
const shopConfMap = ref<Record<string, Record<string, Record<string, any>>>>({})
const getShopConf = (funcCode: string, shopId: string): Record<string, any> => {
  if (!shopConfMap.value[funcCode]) shopConfMap.value[funcCode] = {}
  if (!shopConfMap.value[funcCode][shopId]) shopConfMap.value[funcCode][shopId] = {}
  return shopConfMap.value[funcCode][shopId]
}

const loadSchemas = async (price: GetFunctionPrices_result_itemV2) => {
  const funcCodesFromPrice = price.functions?.map(f => f.code).filter(Boolean) ?? []
  const funcCodes = funcCodesFromPrice.length > 0 ? funcCodesFromPrice : props.functionCode ? [props.functionCode] : []

  if (funcCodes.length === 0) {
    allSchemaResults.value = []
    return
  }
  schemaLoading.value = true
  clearSchemaCache()
  defaultConfMap.value = {}
  shopConfMap.value = {}
  autoRunAfterPay.value = false
  try {
    const results = await apiManager.funcRunTaskApi.GetFuncConfSchemas({
      ShopType: props.shopType,
      FuncCodes: funcCodes
    })
    allSchemaResults.value = results ?? []
    if (autoRunSchemas.value.length > 0) {
      autoRunAfterPay.value = true
      for (const schema of autoRunSchemas.value) {
        if (schema.FuncCode === 'CTGYPRTYMG') {
          if (!shopConfMap.value[schema.FuncCode]) shopConfMap.value[schema.FuncCode] = {}
        } else {
          initDefaultConfFromSchema(schema, getDefaultConf(schema.FuncCode))
        }
      }
    }
  } catch {
    allSchemaResults.value = []
  } finally {
    schemaLoading.value = false
  }
}

watch(selectedPrice, price => {
  if (price) {
    loadSchemas(price)
  } else {
    allSchemaResults.value = []
    autoRunAfterPay.value = false
  }
})

// ---------- 到期时间 ----------
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

const isExpired = (shop: any): boolean => {
  const t = getFunctionEndTime(shop)
  return t === '未开通' || t === '已到期'
}

const removeShop = (index: number) => {
  localShopList.value.splice(index, 1)
  if (localShopList.value.length === 0) {
    gp.$baseMessage('至少保留一家店铺', 'warning', 'hey')
    handleClose()
  }
}

// ---------- 构建提交参数 ----------
/** 判断是否应包含该值，空数组和空对象视为未设置，方便后端用默认参数 */
const shouldIncludeConfValue = (v: any): boolean => {
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v) && v.length === 0) return false
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
  return true
}

const buildDefaultConfValues = (): Record<string, any> | null => {
  const merged: Record<string, any> = {}
  for (const schema of autoRunSchemas.value) {
    const conf = defaultConfMap.value[schema.FuncCode] ?? {}
    for (const [k, v] of Object.entries(conf)) {
      if (shouldIncludeConfValue(v)) merged[k] = v
    }
  }
  return Object.keys(merged).length > 0 ? merged : null
}

const buildShopConfValues = (): ShopConfValue[] => {
  const shopMap: Record<string, Record<string, any>> = {}
  for (const schema of autoRunSchemas.value) {
    const byShop = shopConfMap.value[schema.FuncCode] ?? {}
    for (const shop of localShopList.value) {
      const conf = byShop[shop.id] ?? {}
      const filtered: Record<string, any> = {}
      for (const [k, v] of Object.entries(conf)) {
        if (shouldIncludeConfValue(v)) filtered[k] = v
      }
      if (Object.keys(filtered).length > 0) {
        if (!shopMap[shop.id]) shopMap[shop.id] = {}
        Object.assign(shopMap[shop.id], filtered)
      }
    }
  }
  return Object.entries(shopMap).map(([shopId, vals]) => ({ ShopId: shopId, ConfValues: vals }))
}

// ---------- 续费 ----------
const doRenew = async () => {
  renewLoading.value = true
  try {
    const shouldAutoRun = autoRunAfterPay.value && hasAutoRunFuncs.value
    const parm: BatchPayShopV2_Parm = {
      shops: localShopList.value.map(s => s.id),
      func_price: selectedPriceId.value,
      AutoRunAfterPay: shouldAutoRun,
      DefaultConfValues: shouldAutoRun ? buildDefaultConfValues() : null,
      ShopConfValues: shouldAutoRun ? buildShopConfValues() : null
    }
    const result = await apiManager.functionpriceApi.BatchPayForShopFunc(parm)
    let msg = `续费成功！共 ${result.SuccessCount} 家店铺，消费 ${result.TotalSpent} 积分，续费 ${result.AddDays} 天`
    if (shouldAutoRun) msg += '，已提交后台自动执行任务'
    gp.$baseMessage(msg, 'success', 'hey')
    emit('renewSuccess')
    handleClose()
  } catch (error: any) {
    gp.$baseMessage(error.response?.data?.message || error.message || '续费失败', 'error', 'hey')
  } finally {
    renewLoading.value = false
  }
}

const handleConfirmRenew = async () => {
  if (!selectedPriceId.value) {
    gp.$baseMessage('请选择续费套餐', 'warning', 'hey')
    return
  }
  if (localShopList.value.length === 0) {
    gp.$baseMessage('没有选择店铺', 'warning', 'hey')
    return
  }

  // 检测未到期的店铺（有剩余天数，非"未开通"/"已到期"）
  const notExpiredShops = localShopList.value.filter(shop => !isExpired(shop))
  if (notExpiredShops.length > 0) {
    notExpiredConfirmShops.value = notExpiredShops
    notExpiredConfirmVisible.value = true
    return
  }

  await doRenew()
}

// 未到期二次确认
const notExpiredConfirmVisible = ref(false)
const notExpiredConfirmShops = ref<any[]>([])

const handleNotExpiredIgnore = () => {
  // 移除未到期的店铺，仅保留已到期/未开通的店铺
  const shopIdsToRemove = new Set(notExpiredConfirmShops.value.map((s: any) => s.id))
  localShopList.value = localShopList.value.filter((s: any) => !shopIdsToRemove.has(s.id))
  notExpiredConfirmVisible.value = false
  notExpiredConfirmShops.value = []
  if (localShopList.value.length === 0) {
    gp.$baseMessage('移除后没有可续费的店铺', 'warning', 'hey')
    return
  }
  doRenew()
}

const handleNotExpiredCancel = () => {
  notExpiredConfirmVisible.value = false
  notExpiredConfirmShops.value = []
}

const handleNotExpiredRenewAll = () => {
  notExpiredConfirmVisible.value = false
  notExpiredConfirmShops.value = []
  doRenew()
}

// ---------- 对话框生命周期 ----------
watch(visible, val => {
  if (val) {
    loadPriceList()
  } else {
    priceList.value = []
    selectedPriceId.value = ''
    allSchemaResults.value = []
    autoRunAfterPay.value = false
    autoRunCardExpanded.value = true
    defaultConfMap.value = {}
    shopConfMap.value = {}
    clearSchemaCache()
    fullFuncList.value = []
    groupOptions.value = []
    shopGroupOptionsMap.value = {}
  }
})

watch(
  () => props.functionCode,
  () => {
    if (visible.value) loadPriceList()
  }
)

const handleClose = () => {
  visible.value = false
  localShopList.value = []
}
</script>

<style scoped lang="scss">
// 上方两列区域
.batch-renew-container {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;

  .shop-list-section {
    flex: 1;
    min-width: 0;
  }

  .right-section {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .shop-count {
    font-size: 14px;
    color: #909399;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    gap: 8px;

    h4 {
      margin: 0;
    }
  }
}

.price-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  min-height: 60px;
  max-height: 280px;
  overflow-y: auto;

  .price-card {
    padding: 12px 16px;
    border: 2px solid #e4e7ed;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #fff;

    &:hover,
    &.selected {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .price-card-content {
      display: flex;
      align-items: center;
    }

    .price-func-tags {
      margin-top: 6px;
      padding-left: 24px;
    }
  }
}

.service-card-section {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  flex: 1;
  overflow-y: auto;

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .service-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;

    &.service-card-list-compact {
      gap: 8px;
      margin-top: 8px;
    }
  }

  &.service-card-section-after {
    margin-top: 12px;
    margin-bottom: 12px;
    flex: none;
    padding: 12px 16px;
  }

  .service-card {
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);

    .service-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .service-desc {
      font-size: 12px;
      color: var(--el-text-color-regular);
      line-height: 1.5;

      &.no-notes {
        color: var(--el-text-color-placeholder);
        font-style: italic;
      }
    }
  }
}

// 续费后自动执行 - 下方独占一行可折叠卡片
.auto-run-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;

  .auto-run-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--el-fill-color);
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-dark);
    }

    .auto-run-card-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .collapse-arrow {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        transition: transform 0.25s;
        transform: rotate(0deg);

        &.is-expanded {
          transform: rotate(90deg);
        }
      }
    }

    .auto-run-card-actions {
      flex-shrink: 0;
    }
  }

  .auto-run-card-body {
    .func-schema-block {
      margin: 12px 12px 0;

      &:last-child {
        margin-bottom: 12px;
      }
    }

    .auto-run-tip {
      padding: 16px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 按功能分组区块
.func-schema-block {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;

  .func-schema-title {
    padding: 8px 12px;
    background: var(--el-fill-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-light);
  }
}

.no-params-tip {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: var(--el-color-success);
  font-size: 13px;
  background: var(--el-color-success-light-9);
  border-radius: 0 0 6px 6px;
}

.total-cost-section {
  border-top: 1px solid #dcdfe6;
  padding-top: 16px;

  .cost-calculation {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    font-size: 15px;

    .total-label {
      font-weight: 600;
      margin-left: 12px;
    }

    .total-cost {
      font-size: 20px;
      font-weight: 700;
      color: var(--el-color-primary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.expired-text {
  color: #f56c6c;
  font-weight: 600;
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}

:deep(.el-table) {
  .blur-text {
    filter: blur(4px) !important;
    user-select: none !important;
  }
}

.not-expired-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 1.6;

  .not-expired-icon {
    font-size: 20px;
    color: var(--el-color-warning);
    flex-shrink: 0;
    margin-top: 2px;
  }
}
</style>
