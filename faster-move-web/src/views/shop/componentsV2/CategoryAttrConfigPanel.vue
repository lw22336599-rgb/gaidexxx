<template>
  <div v-loading="loading" class="category-attr-config-panel">
    <template v-if="!firstShopId">
      <div class="no-shop-tip">请先添加续费店铺，以加载可配置的类目属性</div>
    </template>
    <template v-else>
      <!-- 默认参数区域 -->
      <div class="default-conf-area">
        <div class="sub-header">默认参数{{ singleShopMode ? '' : '（所有店铺）' }}</div>

        <!-- 单店铺时显示分组（多店铺时分组在下方各店铺表格中） -->
        <div v-if="singleShopMode" class="conf-section">
          <div class="section-label">设置分组</div>
          <template v-if="shopGroupsMap[firstShopId] === undefined">
            <el-tooltip content="加载当前店铺的分组列表" placement="top">
              <el-button
                type="primary"
                link
                size="small"
                :loading="loadingShopId === firstShopId"
                @click="loadShopGroups(firstShopId)"
              >
                加载分组
              </el-button>
            </el-tooltip>
          </template>
          <el-select
            v-else
            v-model="defaultConf.GroupOffIds"
            multiple
            placeholder="选择要限制的分组（不选则全部）"
            size="small"
            style="width: 100%"
          >
            <el-option v-for="g in flatShopGroups(firstShopId)" :key="g.OfficeId" :label="g.Name" :value="g.OfficeId" />
          </el-select>
        </div>

        <!-- 属性信息 -->
        <div class="conf-section">
          <div class="section-label">属性信息</div>
          <el-alert type="info" :closable="false" show-icon class="attr-empty-rules">
            <template #title>属性值为空时的处理规则</template>
            <ul class="attr-rules-list">
              <li><strong>主料：</strong>留空则根据菜品名称、规格分组名模糊匹配（多选找多个，单选找一个即填）</li>
              <li><strong>辅料：</strong>留空则默认设置为「调味料」</li>
              <li><strong>口味：</strong>留空则默认设置为「原味」</li>
              <li><strong>其他属性：</strong>留空则默认不设置</li>
              <li><strong>若填入的值在类目中找不到，</strong>按上述规则处理</li>
            </ul>
          </el-alert>
          <div class="attr-grid">
            <div v-for="attr in propertyList" :key="attr.Prty.off_id" class="attr-item">
              <label class="attr-label">{{ attr.Prty.name }}</label>
              <el-select
                :model-value="
                  attr.Prty.multi_select
                    ? getDefaultPrttyValues(attr.Prty.off_id)
                    : (getDefaultPrttyValues(attr.Prty.off_id)[0] ?? undefined)
                "
                :remote="!!attr.Prty.need_query"
                :remote-method="attr.Prty.need_query ? (q: string) => handleAttrRemoteSearch(attr, q) : undefined"
                :loading="!!attr.Prty.need_query && attrSearchLoading"
                :multiple="!!attr.Prty.multi_select"
                filterable
                :placeholder="attr.Prty.name"
                size="small"
                style="width: 100%"
                clearable
                @update:model-value="
                  attr.Prty.multi_select
                    ? setDefaultPrttyValues(attr.Prty.off_id, $event)
                    : setDefaultPrttyValues(attr.Prty.off_id, $event != null ? [$event] : [])
                "
              >
                <el-option v-for="v in getAttrOptions(attr)" :key="v.Office_Id" :label="v.Name" :value="v.Office_Id" />
              </el-select>
            </div>
          </div>
          <div v-if="Object.keys(requiredAttrsMap).length > 0" class="required-attrs">
            <span class="required-label">必填属性</span>
            <el-tag
              v-for="(_, key) in requiredAttrsMap"
              :key="key"
              closable
              size="small"
              style="margin-right: 8px; margin-top: 4px"
              @close="removeRequiredAttr(key)"
            >
              {{ getAttrName(key) }} ×
            </el-tag>
          </div>
          <!-- 其他属性（key 可能不在上方列表，用户自行输入） -->
          <div class="othery-prtty-area">
            <div class="section-label">其他属性（属性名可自定义输入）</div>
            <el-table :data="otheryPrttyRows" border size="small" max-height="200">
              <el-table-column label="属性名 " min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.key" placeholder="如：口味" size="small" clearable />
                </template>
              </el-table-column>
              <el-table-column label="属性值" min-width="220">
                <template #default="{ row }">
                  <el-select
                    :key="`othery-${row.key}-${row.values?.length ?? 0}`"
                    v-model="row.values"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入后回车添加，可多个"
                    size="small"
                    style="width: 100%"
                    clearable
                  >
                    <el-option v-for="v in row.values" :key="v" :label="v" :value="v" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="" width="50" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" link size="small" :icon="Delete" @click="removeOtheryRow($index)" />
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link size="small" style="margin-top: 6px" @click="addOtheryRow"
              >+ 添加属性</el-button
            >
          </div>
          <!-- 勾选为必填的属性（未指定值时后端自动填第一个） -->
          <div v-if="propertyList.length > 0" class="required-check-area">
            <div class="section-label">必填属性（未指定时自动填第一个）</div>
            <el-checkbox-group v-model="requiredAttrIds">
              <div class="required-check-grid">
                <el-checkbox v-for="attr in propertyList" :key="attr.Prty.off_id" :label="attr.Prty.off_id">
                  {{ attr.Prty.name }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </div>
      </div>

      <!-- 各店铺单独参数（多店铺时显示） -->
      <div v-if="!singleShopMode" class="shop-conf-area">
        <div class="sub-header">各店铺单独参数（留空则使用默认参数）</div>
        <el-table :data="shopList" border size="small" max-height="280px">
          <el-table-column label="店铺" prop="name" min-width="120" show-overflow-tooltip fixed>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分组" min-width="140">
            <template #default="{ row }">
              <template v-if="shopGroupsMap[row.id] === undefined">
                <el-tooltip content="加载当前店铺的分组列表" placement="top">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    :loading="loadingShopId === row.id"
                    @click="loadShopGroups(row.id)"
                  >
                    加载分组
                  </el-button>
                </el-tooltip>
              </template>
              <el-select
                v-else
                v-model="getShopConf(row.id).GroupOffIds"
                multiple
                placeholder="默认"
                clearable
                size="small"
                style="width: 100%"
              >
                <el-option v-for="g in flatShopGroups(row.id)" :key="g.OfficeId" :label="g.Name" :value="g.OfficeId" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column v-for="attr in propertyList" :key="attr.Prty.off_id" min-width="120">
            <template #header>{{ attr.Prty.name }}</template>
            <template #default="{ row }">
              <el-select
                :model-value="
                  attr.Prty.multi_select
                    ? getShopPrttyValues(row.id)[attr.Prty.off_id]
                    : (getShopPrttyValues(row.id)[attr.Prty.off_id]?.[0] ?? undefined)
                "
                :remote="!!attr.Prty.need_query"
                :remote-method="attr.Prty.need_query ? (q: string) => handleAttrRemoteSearch(attr, q) : undefined"
                :loading="!!attr.Prty.need_query && attrSearchLoading"
                :multiple="!!attr.Prty.multi_select"
                filterable
                placeholder="默认"
                clearable
                size="small"
                style="width: 100%"
                @update:model-value="
                  attr.Prty.multi_select
                    ? (getShopPrttyValues(row.id)[attr.Prty.off_id] = $event)
                    : (getShopPrttyValues(row.id)[attr.Prty.off_id] = $event != null ? [$event] : [])
                "
              >
                <el-option v-for="v in getAttrOptions(attr)" :key="v.Office_Id" :label="v.Name" :value="v.Office_Id" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { apiManager } from '@/TsModel/Api/ApiManager'
import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { CallFuinctionParms } from '@/TsModel/Alien/Controllers/Function/CallFuinctionParms'
import type { PropertyAndValues } from '@/TsModel/Alien/Entity/Function/FOODMOVE/PropertyAndValues'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import type { CtgyAttrValuesReq } from '@/TsModel/Alien/Entity/Function/FOODMOVE/CtgyAttrValuesReq'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

/** 类目属性批量设置 配置结构（与后端 FoodCategoryPrttyMgConf 一致） */
export interface FoodCategoryPrttyMgConf {
  GroupOffIds?: string[]
  PrttyValues?: Record<string, string[]>
  /** 额外必填的属性 id 列表，未指定时后端自动填第一个值 */
  RequiredAttrValues?: string[]
  /** 其他属性：key=属性名，values=默认值列表（需在类目中存在，单选取第一个多选取全部） */
  OtheryPrtty?: Record<string, string[]>
}

const props = withDefaults(
  defineProps<{
    shopType: ShopType
    shopList: any[]
    firstShopId: string
    defaultConf: FoodCategoryPrttyMgConf
    shopConfMap: Record<string, FoodCategoryPrttyMgConf>
  }>(),
  {
    defaultConf: () => ({}),
    shopConfMap: () => ({})
  }
)

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const CTGYPRTYMG_CODE = 'CTGYPRTYMG'

// 单店铺时只显示默认参数（含分组），不显示各店铺单独参数表格
const singleShopMode = computed(() => props.shopList.length <= 1)

const loading = ref(false)
const propertyList = ref<PropertyAndValues[]>([])

// 按店铺缓存分组列表，每个店铺分组不同，点击「加载分组」后才请求
const shopGroupsMap = ref<Record<string, FoodGroupItem[]>>({})
const loadingShopId = ref<string | null>(null)

const getDefaultPrttyValues = (offId: string): string[] => {
  const pv = props.defaultConf.PrttyValues ?? {}
  const arr = pv[offId]
  return Array.isArray(arr) ? [...arr] : []
}

const setDefaultPrttyValues = (offId: string, val: string[]) => {
  const next = { ...(props.defaultConf.PrttyValues ?? {}) }
  if (val.length > 0) {
    next[offId] = val
  } else {
    delete next[offId]
  }
  props.defaultConf.PrttyValues = Object.keys(next).length > 0 ? next : undefined
}

// 其他属性表格行（key + values 数组）
const otheryPrttyRows = ref<{ key: string; values: string[] }[]>([])

function addOtheryRow() {
  otheryPrttyRows.value.push({ key: '', values: [] })
}

function removeOtheryRow(idx: number) {
  otheryPrttyRows.value.splice(idx, 1)
}

let otheryPrttyFromSync = false
function syncOtheryPrttyToConf() {
  const map: Record<string, string[]> = {}
  for (const r of otheryPrttyRows.value) {
    const k = (r.key ?? '').trim()
    if (!k) continue
    const vals = (r.values ?? []).filter(s => (s ?? '').trim())
    if (vals.length > 0) map[k] = vals
  }
  otheryPrttyFromSync = true
  props.defaultConf.OtheryPrtty = Object.keys(map).length > 0 ? map : undefined
  setTimeout(() => {
    otheryPrttyFromSync = false
  }, 0)
}

let otherySkipSync = false
watch(
  () => props.defaultConf.OtheryPrtty,
  v => {
    if (otheryPrttyFromSync) return
    otherySkipSync = true
    if (!v || typeof v !== 'object') {
      otheryPrttyRows.value = [{ key: '', values: [] }]
    } else {
      const rows = Object.entries(v).map(([key, vals]) => ({
        key,
        values: Array.isArray(vals) ? [...vals] : []
      }))
      if (rows.length === 0) rows.push({ key: '', values: [] })
      otheryPrttyRows.value = rows
    }
    setTimeout(() => {
      otherySkipSync = false
    }, 0)
  },
  { immediate: true, deep: true }
)
watch(
  otheryPrttyRows,
  () => {
    if (!otherySkipSync) syncOtheryPrttyToConf()
  },
  { deep: true }
)

// 必填属性 id 列表（勾选则未指定时后端自动填第一个）
const requiredAttrIds = computed({
  get: () => props.defaultConf.RequiredAttrValues ?? [],
  set: (val: string[]) => {
    props.defaultConf.RequiredAttrValues = val.length > 0 ? val : undefined
  }
})

// 必填属性：从 Prty.required 且在 PrttyValues 中有值（展示已选中的必填）
const requiredAttrsMap = computed(() => {
  const pv = props.defaultConf.PrttyValues ?? {}
  const map: Record<string, boolean> = {}
  for (const attr of propertyList.value) {
    if (attr.Prty.required && Array.isArray(pv[attr.Prty.off_id]) && pv[attr.Prty.off_id].length > 0) {
      map[attr.Prty.off_id] = true
    }
  }
  return map
})

const removeRequiredAttr = (key: string) => {
  const pv = props.defaultConf.PrttyValues ?? {}
  const next = { ...pv }
  delete next[key]
  props.defaultConf.PrttyValues = Object.keys(next).length > 0 ? next : undefined
}

const getAttrName = (offId: string) => propertyList.value.find(a => a.Prty.off_id === offId)?.Prty.name ?? offId

const getAttrOptions = (attr: PropertyAndValues) => attr.Values ?? []

// 远程搜索：请求序号，避免异步竞态导致旧响应覆盖新结果
let attrSearchReqId = 0

const attrSearchLoading = ref(false)

/** 属性值远程搜索（输入框值变动且不为空时调用，为空时保留已有选项供选择） */
const doAttrRemoteSearch = async (attr: PropertyAndValues, query: string) => {
  const q = query?.trim?.() ?? ''
  if (!attr.Prty.need_query) return
  if (!q) return // 空输入不请求也不清空，保留 GetPropertyAndValues 返回的前若干项供直接选择
  const reqId = ++attrSearchReqId
  attrSearchLoading.value = true
  try {
    const req: CtgyAttrValuesReq = { AttrId: parseInt(attr.Prty.off_id, 10) || 0, Keyword: q }
    const res = await callFunctionAsync('SearchAttrValues', req)
    if (reqId !== attrSearchReqId) return
    if (Array.isArray(res)) {
      attr.Values = res.map((r: any) => ({
        Name: r.ValueName ?? r.valueName ?? r.name,
        Office_Id: String(r.Key ?? r.key ?? r.Office_Id ?? r.office_id ?? '')
      }))
    } else {
      attr.Values = []
    }
  } catch {
    if (reqId === attrSearchReqId) attr.Values = []
  } finally {
    if (reqId === attrSearchReqId) attrSearchLoading.value = false
  }
}

const handleAttrRemoteSearch = useDebounceFn((attr: PropertyAndValues, query: string) => {
  doAttrRemoteSearch(attr, query)
}, 300)

/** 统一解析 CallFunction 返回值：可能是 JSON 对象或 JSON 字符串 */
function parseCallFunctionResult<T = any>(res: unknown): T {
  if (res == null) return res as T
  if (typeof res === 'string') {
    try {
      return JSON.parse(res) as T
    } catch {
      return res as T
    }
  }
  return res as T
}

const callFunctionAsync = async (method: string, parmObj?: any): Promise<any> => {
  const parms: CallFuinctionParms = {
    ShopType: props.shopType,
    FunctionCode: CTGYPRTYMG_CODE,
    ShopId: props.firstShopId,
    Method: method,
    ParmsObj: parmObj != null ? JSON.stringify(parmObj) : '{}'
  }
  const raw = await apiManager.functionuserApi.CallFunction(parms)
  return parseCallFunctionResult(raw)
}

const loadConfigOptions = async () => {
  if (!props.firstShopId) return
  loading.value = true
  try {
    const propsRes = await callFunctionAsync('GetPropertyAndValues')
    propertyList.value = Array.isArray(propsRes) ? propsRes : []
  } catch {
    propertyList.value = []
  } finally {
    loading.value = false
  }
}

const getShopGroups = (shopId: string): FoodGroupItem[] => shopGroupsMap.value[shopId] ?? []

/** 递归展平分组树，支持任意层级子分组 */
function flattenGroupTree(items: FoodGroupItem[] | FoodGroupItem | null | undefined): FoodGroupItem[] {
  const list: FoodGroupItem[] = []
  const walk = (nodes: FoodGroupItem[] | FoodGroupItem | null | undefined) => {
    if (!nodes) return
    const arr = Array.isArray(nodes) ? nodes : [nodes]
    for (const g of arr) {
      if (!g || typeof g !== 'object') continue
      list.push(g)
      const children = g.Children ?? (g as any).children
      if (Array.isArray(children) && children.length > 0) walk(children)
    }
  }
  walk(items)
  return list
}

const flatShopGroups = (shopId: string): FoodGroupItem[] => flattenGroupTree(getShopGroups(shopId))

const loadShopGroups = async (shopId: string) => {
  if (shopGroupsMap.value[shopId] !== undefined) return
  loadingShopId.value = shopId
  try {
    const parms: CallFuinctionParms = {
      ShopType: props.shopType,
      FunctionCode: CTGYPRTYMG_CODE,
      ShopId: shopId,
      Method: 'GetFoodGroups',
      ParmsObj: '{}'
    }
    const raw = await apiManager.functionuserApi.CallFunction(parms)
    const res = parseCallFunctionResult(raw)
    // 兼容数组或单对象（含 Children），保留树结构供递归展平
    const normalized = Array.isArray(res) ? res : res && typeof res === 'object' ? [res] : []
    shopGroupsMap.value[shopId] = normalized
  } catch {
    shopGroupsMap.value[shopId] = []
  } finally {
    loadingShopId.value = null
  }
}

const getShopConf = (shopId: string): FoodCategoryPrttyMgConf => {
  const map = props.shopConfMap as Record<string, FoodCategoryPrttyMgConf>
  if (!map[shopId]) map[shopId] = {}
  const conf = map[shopId]
  if (!Array.isArray(conf.GroupOffIds)) conf.GroupOffIds = []
  if (!conf.PrttyValues || typeof conf.PrttyValues !== 'object') conf.PrttyValues = {}
  return conf
}

const getShopPrttyValues = (shopId: string): Record<string, string[]> => {
  const conf = getShopConf(shopId)
  if (!conf.PrttyValues) conf.PrttyValues = {}
  return conf.PrttyValues
}

// 确保 defaultConf 结构正确
watch(
  () => props.defaultConf,
  c => {
    if (!c) return
    if (!Array.isArray(c.GroupOffIds)) c.GroupOffIds = []
    if (!c.PrttyValues || typeof c.PrttyValues !== 'object') c.PrttyValues = {}
  },
  { immediate: true, deep: true }
)

watch(
  () => props.firstShopId,
  id => {
    if (id) loadConfigOptions()
  },
  { immediate: true }
)

onMounted(() => {
  if (props.firstShopId) loadConfigOptions()
})
</script>

<style scoped lang="scss">
.category-attr-config-panel {
  min-height: 80px;
}

.no-shop-tip {
  padding: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.default-conf-area {
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-light);
}

.sub-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.conf-section {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.attr-empty-rules {
  margin-bottom: 10px;

  .attr-rules-list {
    margin: 4px 0 0;
    padding-left: 18px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
}

.section-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 6px;
}

.attr-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 20px;
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .attr-label {
    width: 72px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-regular);
    text-align: right;
  }

  :deep(.el-select) {
    flex: 1;
    min-width: 0;
  }
}

.required-attrs {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-lighter);

  .required-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-right: 8px;
  }
}

.othery-prtty-area {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.required-check-area {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.required-check-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.shop-conf-area {
  padding: 12px;
}

.blur-text {
  filter: blur(4px);
  user-select: none;
}
</style>
