<template>
  <el-dialog v-model="visible" title="任务执行中心" width="1200px" :before-close="handleClose" destroy-on-close>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- ===== Tab 1: 任务记录 ===== -->
      <el-tab-pane label="任务记录" name="tasks">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-input v-model="filterShopName" placeholder="店铺名称" clearable style="width:160px" @change="handleSearch" />
          <el-input v-model="filterOffId" placeholder="门店ID" clearable style="width:150px" @change="handleSearch" />
          <el-select v-model="filterFuncCode" placeholder="功能" clearable style="width:140px" @change="handleSearch">
            <el-option v-for="item in functionOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="任务状态" clearable style="width:130px" @change="handleSearch">
            <el-option label="待执行" :value="FuncRunTaskStatus.Pending" />
            <el-option label="执行中" :value="FuncRunTaskStatus.Running" />
            <el-option label="已完成" :value="FuncRunTaskStatus.Succeeded" />
            <el-option label="执行失败" :value="FuncRunTaskStatus.Failed" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-button :icon="Download" :loading="exporting" @click="handleExport">导出</el-button>
          <el-button type="success" :disabled="selectedRows.length === 0" @click="openTriggerDialog"
            style="margin-left:auto">
            再次执行 ({{ selectedRows.length }})
          </el-button>
        </div>

        <!-- 任务列表 -->
        <el-table ref="tableRef" :data="taskList" v-loading="loading" border @selection-change="handleSelectionChange"
          max-height="430px">
          <el-table-column type="selection" width="50" />
          <el-table-column label="店铺名称" prop="shop_name" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.shop_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="off_id" width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.off_id">{{ row.off_id }}</span>
              <span v-else class="no-msg">-</span>
            </template>
          </el-table-column>
          <el-table-column label="功能" min-width="110" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ getFuncName(row.func_code) || row.func_code }}</span>
              <span v-if="row.func_name && row.func_name !== row.func_code" class="func-code-tag">
                {{ row.func_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="runStatusTagType(row.run_status)" size="small">
                {{ runStatusLabel(row.run_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="开始时间" width="150">
            <template #default="{ row }">{{ formatDate(row.start_time) }}</template>
          </el-table-column>
          <el-table-column label="结束时间" width="150">
            <template #default="{ row }">{{ formatDate(row.end_time) }}</template>
          </el-table-column>
          <el-table-column label="结果信息" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.msg" class="msg-cell" @click="showMsgDetail(row.msg)">{{ row.msg }}</span>
              <span v-else class="no-msg">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="triggerSingle(row)">重新触发</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-bar">
          <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
            :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSearch"
            @current-change="loadData" />
        </div>
      </el-tab-pane>

      <!-- ===== Tab 2: 执行进度 ===== -->
      <el-tab-pane label="执行进度" name="jobs">
        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-select v-model="jobFilterFuncCode" placeholder="功能" clearable style="width:140px"
            @change="handleJobSearch">
            <el-option v-for="item in functionOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
          <el-select v-model="jobFilterStatus" placeholder="任务状态" clearable style="width:140px"
            @change="handleJobSearch">
            <el-option label="待处理" :value="JobStatus.Pending" />
            <el-option label="已入队" :value="JobStatus.Enqueued" />
            <el-option label="执行中" :value="JobStatus.Processing" />
            <el-option label="已完成" :value="JobStatus.Succeeded" />
            <el-option label="已计划" :value="JobStatus.Scheduled" />
            <el-option label="已失败" :value="JobStatus.Failed" />
            <el-option label="已删除" :value="JobStatus.Deleted" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="handleJobSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleJobReset">重置</el-button>
          <el-button :icon="RefreshRight" @click="loadJobData" style="margin-left:auto">刷新</el-button>
        </div>

        <!-- 进度列表 -->
        <el-table :data="jobList" v-loading="jobLoading" border max-height="430px">
          <el-table-column label="任务名称" prop="task_name" min-width="200" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="jobStatusTagType(row.job_status)" size="small">
                {{ jobStatusLabel(row.job_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度" min-width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress :percentage="calcPercent(row)" :status="progressStatus(row.job_status)" :stroke-width="10"
                  style="flex:1" />
                <span class="progress-text">{{ row.progress }}/{{ row.total }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="成功/失败" width="100" align="center">
            <template #default="{ row }">
              <span class="success-count">{{ row.success_count ?? '-' }}</span>
              /
              <span class="fail-count">{{ row.fail_count ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="最后更新" width="150">
            <template #default="{ row }">{{ formatDate(row.last_update_time) }}</template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.remark">{{ row.remark }}</span>
              <span v-else class="no-msg">-</span>
            </template>
          </el-table-column>
          <el-table-column label="错误信息" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.error_message" class="msg-cell" @click="showMsgDetail(row.error_message)">
                {{ row.error_message }}
              </span>
              <span v-else class="no-msg">-</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-bar">
          <el-pagination v-model:current-page="jobPage" v-model:page-size="jobPageSize" :total="jobTotal"
            :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @size-change="handleJobSearch"
            @current-change="loadJobData" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 结果信息详情弹窗 -->
    <el-dialog v-model="msgDetailVisible" title="详细信息" width="600px" append-to-body>
      <pre class="msg-detail">{{ currentMsg }}</pre>
    </el-dialog>

    <!-- 手动触发参数配置弹窗 -->
    <el-dialog v-model="triggerDialogVisible" title="手动触发 - 配置参数" width="900px" append-to-body
      :before-close="closeTriggerDialog">
      <div v-if="triggerSchemaLoading" v-loading="true" style="height:120px" />
      <template v-else>
        <div v-if="!hasTriggerSchema" class="no-schema-tip">
          该功能无需配置参数，直接触发即可。
        </div>
        <!-- 类目属性批量设置：使用独立配置组件 -->
        <CategoryAttrConfigPanel v-else-if="triggerFuncCode === 'CTGYPRTYMG'" :shop-type="props.shopType"
          :shop-list="triggerShopsForAttrPanel" :first-shop-id="triggerShops[0]?.shop_id ?? ''"
          :default-conf="triggerDefaultConf as any" :shop-conf-map="triggerShopConfMap" />
        <FuncConfSchemaForm v-else-if="triggerSchemaResult" :schema="triggerSchemaResult"
          :default-conf="triggerDefaultConf" :shop-list="triggerShops.map(s => ({ id: s.shop_id, name: s.shop_name }))"
          :get-shop-conf="getTriggerShopConf" :group-options="triggerGroupOptions"
          :group-options-loading="triggerGroupOptionsLoading" :get-shop-group-options="getTriggerShopGroupOptions"
          :get-shop-group-options-loading="getTriggerShopGroupOptionsLoading"
          :on-ensure-default-group-options="() => triggerShops.length > 0 && triggerEnsureGroupOptions(triggerShops[0].shop_id)"
          :on-ensure-group-options="triggerEnsureGroupOptions" :demo-mode="demoMode" />
      </template>

      <template #footer>
        <el-button @click="closeTriggerDialog">取消</el-button>
        <el-button type="primary" :loading="triggerLoading" @click="confirmTrigger">确认触发</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Refresh, RefreshRight, QuestionFilled, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FoodGroupItem } from '@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { FuncRunTaskStatus } from '@/TsModel/Alien/Entity/Enums/FuncRunTaskStatus'
import { JobStatus } from '@/TsModel/Alien/Entity/Enums/JobStatus'
import { t_wmt_func_run_task } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_func_run_task'
import { t_ls_job_info } from '@/TsModel/Alien/Entity/Tables/Job/t_ls_job_info'
import { TriggerFuncRunParm } from '@/TsModel/Alien/Controllers/Function/TriggerFuncRunParm'
import { ShopConfValue } from '@/TsModel/Alien/Controllers/Function/ShopConfValue'
import { gp } from '/@vab/plugins/vab'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import CategoryAttrConfigPanel from './CategoryAttrConfigPanel.vue'
import FuncConfSchemaForm from './FuncConfSchemaForm.vue'
import { getParsedProperties, initDefaultConfFromSchema } from './useFuncConfSchema'
import type { FuncConfSchemaResult } from '@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult'

const props = defineProps<{
  modelValue: boolean
  shopType: ShopType
  functionOptions: Array<{ code: string; name: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// ---------- Tab ----------
const activeTab = ref<'tasks' | 'jobs'>('tasks')

const handleTabChange = (tab: string | number) => {
  if (tab === 'jobs' && jobList.value.length === 0) {
    loadJobData()
  }
}

// ================================================================
// Tab 1: 任务记录
// ================================================================
const taskList = ref<t_wmt_func_run_task[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filterShopName = ref('')
const filterOffId = ref('')
const filterFuncCode = ref<string | undefined>(undefined)
const filterStatus = ref<FuncRunTaskStatus | undefined>(undefined)

const selectedRows = ref<t_wmt_func_run_task[]>([])
const tableRef = ref()

const handleSelectionChange = (rows: t_wmt_func_run_task[]) => {
  selectedRows.value = rows
}

const loadData = async () => {
  loading.value = true
  try {
    const result = await apiManager.funcRunTaskApi.GetFuncRunTaskPage({
      page: page.value,
      pageSize: pageSize.value,
      shop_name: filterShopName.value || null,
      off_id: filterOffId.value || null,
      func_code: filterFuncCode.value || null,
      run_status: filterStatus.value ?? null,
      shop_type: props.shopType,
    })
    taskList.value = (result as any).rows ?? []
    total.value = result.total ?? 0
  } catch {
    taskList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  filterShopName.value = ''
  filterOffId.value = ''
  filterFuncCode.value = undefined
  filterStatus.value = undefined
  handleSearch()
}

// 任务记录状态
const runStatusLabel = (status: FuncRunTaskStatus) => {
  const map: Record<number, string> = {
    [FuncRunTaskStatus.Pending]: '待执行',
    [FuncRunTaskStatus.Running]: '执行中',
    [FuncRunTaskStatus.Succeeded]: '已完成',
    [FuncRunTaskStatus.Failed]: '执行失败',
  }
  return map[status] ?? '未知'
}

const runStatusTagType = (status: FuncRunTaskStatus): 'success' | 'warning' | 'danger' | 'info' | undefined => {
  const map: Record<number, 'success' | 'warning' | 'danger' | 'info'> = {
    [FuncRunTaskStatus.Pending]: 'info',
    [FuncRunTaskStatus.Running]: 'warning',
    [FuncRunTaskStatus.Succeeded]: 'success',
    [FuncRunTaskStatus.Failed]: 'danger',
  }
  return map[status]
}

const getFuncName = (code: string) => props.functionOptions.find(f => f.code === code)?.name ?? ''

// ================================================================
// Tab 2: 执行进度 (t_ls_job_info)
// ================================================================
const jobList = ref<t_ls_job_info[]>([])
const jobLoading = ref(false)
const jobTotal = ref(0)
const jobPage = ref(1)
const jobPageSize = ref(20)

const jobFilterFuncCode = ref<string | undefined>(undefined)
const jobFilterStatus = ref<JobStatus | undefined>(undefined)

// 固定过滤 task_name 包含"自动执行功能"
const JOB_TASK_NAME_KEYWORD = '自动执行功能'

const loadJobData = async () => {
  jobLoading.value = true
  try {
    const result = await apiManager.funcRunTaskApi.GetFuncJobInfoPage({
      page: jobPage.value,
      pageSize: jobPageSize.value,
      func_code: jobFilterFuncCode.value || null,
      task_name: JOB_TASK_NAME_KEYWORD,
      job_status: jobFilterStatus.value ?? null,
    })
    jobList.value = (result as any).rows ?? []
    jobTotal.value = result.total ?? 0
  } catch {
    jobList.value = []
  } finally {
    jobLoading.value = false
  }
}

const handleJobSearch = () => {
  jobPage.value = 1
  loadJobData()
}

const handleJobReset = () => {
  jobFilterFuncCode.value = undefined
  jobFilterStatus.value = undefined
  handleJobSearch()
}

// Hangfire 任务状态
const jobStatusLabel = (status: JobStatus) => {
  const map: Record<number, string> = {
    [JobStatus.Pending]: '待处理',
    [JobStatus.Enqueued]: '已入队',
    [JobStatus.Processing]: '执行中',
    [JobStatus.Succeeded]: '已完成',
    [JobStatus.Scheduled]: '已计划',
    [JobStatus.Failed]: '已失败',
    [JobStatus.Deleted]: '已删除',
  }
  return map[status] ?? '未知'
}

const jobStatusTagType = (status: JobStatus): 'success' | 'warning' | 'danger' | 'info' | undefined => {
  const map: Record<number, 'success' | 'warning' | 'danger' | 'info' | undefined> = {
    [JobStatus.Pending]: 'info',
    [JobStatus.Enqueued]: 'info',
    [JobStatus.Processing]: 'warning',
    [JobStatus.Succeeded]: 'success',
    [JobStatus.Scheduled]: undefined,
    [JobStatus.Failed]: 'danger',
    [JobStatus.Deleted]: 'danger',
  }
  return map[status]
}

const progressStatus = (status: JobStatus): 'success' | 'exception' | 'warning' | undefined => {
  if (status === JobStatus.Succeeded) return 'success'
  if (status === JobStatus.Failed || status === JobStatus.Deleted) return 'exception'
  return undefined
}

const calcPercent = (row: t_ls_job_info): number => {
  if (row.curr_percent != null) return Math.min(100, Math.round(row.curr_percent))
  if (row.total && row.total > 0) return Math.min(100, Math.round((row.progress / row.total) * 100))
  if (row.job_status === JobStatus.Succeeded) return 100
  return 0
}

// ================================================================
// 通用
// ================================================================
const formatDate = (val: Date | string | null | undefined) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(val)
  }
}

// 结果详情弹窗
const msgDetailVisible = ref(false)
const currentMsg = ref('')

const showMsgDetail = (msg: string) => {
  currentMsg.value = msg
  msgDetailVisible.value = true
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    activeTab.value = 'tasks'
    handleReset()
  }
})

// ================================================================
// 手动触发
// ================================================================
interface SchemaProperty {
  type?: string
  title?: string
  description?: string
  enum?: any[]
  enumNames?: string[]
  default?: any
  oneOf?: any[]
  $ref?: string
  [key: string]: any
}
interface JsonSchema {
  properties?: Record<string, SchemaProperty>
  definitions?: Record<string, any>
  [key: string]: any
}

const triggerDialogVisible = ref(false)
const triggerLoading = ref(false)
const triggerSchemaLoading = ref(false)

const triggerShops = ref<Array<{ shop_id: string; shop_name: string; func_code: string }>>([])
const triggerFuncCode = ref('')
const triggerTaskRows = ref<t_wmt_func_run_task[]>([])

// CategoryAttrConfigPanel 需要的店铺格式 { id, name }
const triggerShopsForAttrPanel = computed(() =>
  triggerShops.value.map((s) => ({ id: s.shop_id, name: s.shop_name }))
)

const triggerParsedSchema = ref<JsonSchema | null>(null)
const triggerSchemaResult = ref<FuncConfSchemaResult | null>(null)
const hasTriggerSchema = computed(
  () => triggerFuncCode.value === 'CTGYPRTYMG' || (triggerSchemaResult.value != null && Object.keys(getParsedProperties(triggerSchemaResult.value)).length > 0)
)

const triggerDefaultConf = ref<Record<string, any>>({})
const triggerShopConfMap = ref<Record<string, Record<string, any>>>({})
const triggerGroupOptions = ref<FoodGroupItem[]>([])
const triggerGroupOptionsLoading = ref(false)
const triggerShopGroupOptionsMap = ref<Record<string, FoodGroupItem[]>>({})
const triggerShopGroupLoadingMap = ref<Record<string, boolean>>({})

function triggerFlattenGroupTree(items: FoodGroupItem[] | FoodGroupItem | null | undefined): FoodGroupItem[] {
  const list: FoodGroupItem[] = []
  const walk = (nodes: FoodGroupItem[] | FoodGroupItem | null | undefined) => {
    if (Array.isArray(nodes)) nodes.forEach(walk)
    else if (nodes) { list.push(nodes); walk(nodes.Children) }
  }
  walk(items)
  return list
}

async function triggerFetchGroupsForShop(shopId: string): Promise<FoodGroupItem[]> {
  try {
    const raw = await apiManager.funcRunTaskApi.GetShopGroups(shopId)
    return triggerFlattenGroupTree(raw)
  } catch {
    return []
  }
}

async function triggerEnsureGroupOptions(shopId: string) {
  if (triggerShopGroupOptionsMap.value[shopId]) return
  triggerShopGroupLoadingMap.value[shopId] = true
  try {
    triggerShopGroupOptionsMap.value[shopId] = await triggerFetchGroupsForShop(shopId)
  } finally {
    triggerShopGroupLoadingMap.value[shopId] = false
  }
}

const getTriggerShopGroupOptions = (shopId: string): FoodGroupItem[] => triggerShopGroupOptionsMap.value[shopId] ?? []
const getTriggerShopGroupOptionsLoading = (shopId: string): boolean => !!triggerShopGroupLoadingMap.value[shopId]

const getTriggerShopConf = (shopId: string): Record<string, any> => {
  if (!triggerShopConfMap.value[shopId]) triggerShopConfMap.value[shopId] = {}
  return triggerShopConfMap.value[shopId]
}

// 解析 $ref 引用
const resolveRef = (refStr: string, rootSchema: JsonSchema): SchemaProperty | null => {
  if (!refStr.startsWith('#/')) return null
  const parts = refStr.slice(2).split('/')
  let node: any = rootSchema
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return null
    node = node[part]
  }
  return node ?? null
}

// 解析属性，处理 $ref 和 oneOf 引用
const resolveProperty = (prop: SchemaProperty, rootSchema: JsonSchema): SchemaProperty => {
  // 处理 oneOf 中的 $ref
  if (!prop.enum && Array.isArray(prop.oneOf)) {
    for (const item of prop.oneOf) {
      if (item.$ref) {
        const resolved = resolveRef(item.$ref, rootSchema)
        if (resolved?.enum) {
          return {
            ...prop,
            enum: resolved.enum,
            enumNames: resolved['x-enumNames'] ?? resolved.enumNames,
            type: resolved.type ?? prop.type,
            default: prop.default ?? resolved.default,
          }
        }
      }
    }
  }
  // 处理直接的 $ref
  if (!prop.enum && prop.$ref) {
    const resolved = resolveRef(prop.$ref, rootSchema)
    if (resolved?.enum) {
      return {
        ...prop,
        enum: resolved.enum,
        enumNames: resolved['x-enumNames'] ?? resolved.enumNames,
        type: resolved.type ?? prop.type,
        default: prop.default ?? resolved.default,
      }
    }
  }
  return prop
}

const loadTriggerSchema = async (funcCode: string) => {
  triggerSchemaLoading.value = true
  triggerParsedSchema.value = null
  triggerSchemaResult.value = null
  triggerDefaultConf.value = {}
  triggerShopConfMap.value = {}
  triggerGroupOptions.value = []
  triggerShopGroupOptionsMap.value = {}
  try {
    if (funcCode === 'CTGYPRTYMG') {
      const taskRows = triggerTaskRows.value
      const singleMode = taskRows.length <= 1
      const parseConf = (json: string | null | undefined): Record<string, any> => {
        if (!json || typeof json !== 'string') return {}
        try {
          const obj = JSON.parse(json)
          return obj && typeof obj === 'object' ? obj : {}
        } catch {
          return {}
        }
      }
      if (singleMode && taskRows.length > 0) {
        const conf = parseConf(taskRows[0].conf_json)
        triggerDefaultConf.value = {
          GroupOffIds: Array.isArray(conf.GroupOffIds) ? conf.GroupOffIds : [],
          PrttyValues: conf.PrttyValues && typeof conf.PrttyValues === 'object' ? conf.PrttyValues : {},
          RequiredAttrValues: Array.isArray(conf.RequiredAttrValues) ? conf.RequiredAttrValues : undefined,
          OtheryPrtty: conf.OtheryPrtty && typeof conf.OtheryPrtty === 'object' ? conf.OtheryPrtty : undefined,
        }
      } else {
        triggerDefaultConf.value = { GroupOffIds: [], PrttyValues: {} }
        for (const row of taskRows) {
          const conf = parseConf(row.conf_json)
          triggerShopConfMap.value[row.shop_id] = {
            GroupOffIds: Array.isArray(conf.GroupOffIds) ? conf.GroupOffIds : [],
            PrttyValues: conf.PrttyValues && typeof conf.PrttyValues === 'object' ? conf.PrttyValues : {},
            RequiredAttrValues: Array.isArray(conf.RequiredAttrValues) ? conf.RequiredAttrValues : undefined,
            OtheryPrtty: conf.OtheryPrtty && typeof conf.OtheryPrtty === 'object' ? conf.OtheryPrtty : undefined,
          }
        }
      }
      return
    }
    const schemaStr = await apiManager.funcRunTaskApi.GetFuncConfSchema(props.shopType, funcCode)
    if (schemaStr) {
      const parsed: JsonSchema = typeof schemaStr === 'string' ? JSON.parse(schemaStr) : schemaStr
      triggerParsedSchema.value = parsed
      triggerSchemaResult.value = { FuncCode: funcCode, ConfSchema: schemaStr, AutoRenewRun: false }
      initDefaultConfFromSchema(triggerSchemaResult.value, triggerDefaultConf.value)

      const taskRows = triggerTaskRows.value
      const parseConf = (json: string | null | undefined): Record<string, any> => {
        if (!json || typeof json !== 'string') return {}
        try {
          const obj = JSON.parse(json)
          return obj && typeof obj === 'object' ? obj : {}
        } catch {
          return {}
        }
      }
      if (taskRows.length === 1) {
        const conf = parseConf(taskRows[0].conf_json)
        for (const [k, v] of Object.entries(conf)) {
          if (v !== undefined && v !== null) triggerDefaultConf.value[k] = v
        }
      } else if (taskRows.length > 1) {
        for (const row of taskRows) {
          triggerShopConfMap.value[row.shop_id] = parseConf(row.conf_json)
        }
      }

      const properties = parsed.properties ?? {}
      const rootSchema = parsed
      const hasFetchShopGroups = Object.values(properties).some((f) =>
        resolveProperty(f, rootSchema)['x-fetchShopGroups'])
      if (hasFetchShopGroups && triggerShops.value.length > 0) {
        triggerGroupOptionsLoading.value = true
        try {
          triggerGroupOptions.value = await triggerFetchGroupsForShop(triggerShops.value[0].shop_id)
        } finally {
          triggerGroupOptionsLoading.value = false
        }
        for (const s of triggerShops.value) {
          triggerEnsureGroupOptions(s.shop_id)
        }
      }
    }
  } catch {
    triggerParsedSchema.value = null
    triggerSchemaResult.value = null
  } finally {
    triggerSchemaLoading.value = false
  }
}

const openTriggerDialog = async () => {
  if (selectedRows.value.length === 0) return
  const codes = [...new Set(selectedRows.value.map(r => r.func_code))]
  if (codes.length > 1) {
    gp.$baseMessage('请只选择同一功能的任务记录再手动触发', 'warning', 'hey')
    return
  }
  triggerFuncCode.value = codes[0]
  triggerTaskRows.value = selectedRows.value
  triggerShops.value = selectedRows.value.map(r => ({
    shop_id: r.shop_id,
    shop_name: r.shop_name ?? r.shop_id,
    func_code: r.func_code,
  }))
  triggerDialogVisible.value = true
  await loadTriggerSchema(triggerFuncCode.value)
}

const triggerSingle = async (row: t_wmt_func_run_task) => {
  triggerFuncCode.value = row.func_code
  triggerTaskRows.value = [row]
  triggerShops.value = [{ shop_id: row.shop_id, shop_name: row.shop_name ?? row.shop_id, func_code: row.func_code }]
  triggerDialogVisible.value = true
  await loadTriggerSchema(row.func_code)
}

const closeTriggerDialog = () => {
  triggerDialogVisible.value = false
  triggerShops.value = []
  triggerTaskRows.value = []
  triggerFuncCode.value = ''
  triggerParsedSchema.value = null
  triggerSchemaResult.value = null
  triggerDefaultConf.value = {}
  triggerShopConfMap.value = {}
}

/** 判断是否应包含该值，空数组和空对象视为未设置，方便后端用默认参数 */
const shouldIncludeConfValue = (v: any): boolean => {
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v) && v.length === 0) return false
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
  return true
}

const buildTriggerDefaultConf = (): Record<string, any> | null => {
  const filtered: Record<string, any> = {}
  for (const [k, v] of Object.entries(triggerDefaultConf.value)) {
    if (shouldIncludeConfValue(v)) filtered[k] = v
  }
  return Object.keys(filtered).length > 0 ? filtered : null
}

const buildTriggerShopConfValues = (): ShopConfValue[] => {
  const result: ShopConfValue[] = []
  for (const shop of triggerShops.value) {
    const conf = triggerShopConfMap.value[shop.shop_id]
    if (!conf) continue
    const filtered: Record<string, any> = {}
    for (const [k, v] of Object.entries(conf)) {
      if (shouldIncludeConfValue(v)) filtered[k] = v
    }
    if (Object.keys(filtered).length > 0) result.push({ ShopId: shop.shop_id, ConfValues: filtered })
  }
  return result
}

const confirmTrigger = async () => {
  if (triggerShops.value.length === 0) return
  triggerLoading.value = true
  try {
    const parm: TriggerFuncRunParm = {
      func_code: triggerFuncCode.value,
      shop_ids: triggerShops.value.map(s => s.shop_id),
      default_conf_values: buildTriggerDefaultConf(),
      shop_conf_values: buildTriggerShopConfValues(),
    }
    await apiManager.funcRunTaskApi.TriggerFuncRun(parm)
    gp.$baseMessage(`已成功触发 ${triggerShops.value.length} 家店铺的任务`, 'success', 'hey')
    closeTriggerDialog()
    loadData()
  } catch (error: any) {
    gp.$baseMessage(error.message || '触发失败', 'error', 'hey')
  } finally {
    triggerLoading.value = false
  }
}

// ================================================================
// 导出
// ================================================================
const exporting = ref(false)

const handleExport = async () => {
  exporting.value = true
  try {
    const batchSize = 100
    let currentPage = 1
    let allRows: t_wmt_func_run_task[] = []
    let fetchedTotal = 0

    // 先取第一页获取总数
    const first = await apiManager.funcRunTaskApi.GetFuncRunTaskPage({
      page: 1,
      pageSize: batchSize,
      shop_name: filterShopName.value || null,
      off_id: filterOffId.value || null,
      func_code: filterFuncCode.value || null,
      run_status: filterStatus.value ?? null,
      shop_type: props.shopType,
    })
    fetchedTotal = first.total ?? 0
    allRows = (first as any).rows ?? []

    if (fetchedTotal === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    const totalPages = Math.ceil(fetchedTotal / batchSize)
    for (currentPage = 2; currentPage <= totalPages; currentPage++) {
      const result = await apiManager.funcRunTaskApi.GetFuncRunTaskPage({
        page: currentPage,
        pageSize: batchSize,
        shop_name: filterShopName.value || null,
        off_id: filterOffId.value || null,
        func_code: filterFuncCode.value || null,
        run_status: filterStatus.value ?? null,
        shop_type: props.shopType,
      })
      allRows = allRows.concat((result as any).rows ?? [])
    }

    // 构建 CSV 数据
    const headers = ['店铺名称', '门店ID', '功能', '状态', '开始时间', '结束时间', '结果信息']
    const rows = allRows.map(row => [
      row.shop_name ?? '',
      row.off_id ?? '',
      getFuncName(row.func_code) || row.func_code,
      runStatusLabel(row.run_status),
      formatDate(row.start_time),
      formatDate(row.end_time),
      row.msg ?? '',
    ])

    const csvContent = [headers, ...rows]
      .map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const now = new Date()
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    link.download = `任务记录_${dateStr}.csv`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success(`导出成功，共 ${allRows.length} 条记录`)
  } catch {
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  row-gap: 10px;
  margin-bottom: 14px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.func-code-tag {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.msg-cell {
  cursor: pointer;
  color: var(--el-color-primary);
  text-decoration: underline dotted;

  &:hover {
    opacity: 0.8;
  }
}

.no-msg {
  color: var(--el-text-color-placeholder);
}

.msg-detail {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 6px;
}

.no-schema-tip {
  color: var(--el-text-color-secondary);
  padding: 20px 0;
  text-align: center;
}

.trigger-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.object-field-wrap {
  padding: 8px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;

  .object-field-label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .object-field-inner {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .object-sub-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .object-sub-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    min-width: 72px;
  }
}

.array-of-object-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .array-item-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .array-item-fields {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .array-item-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.same-default-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.trigger-default-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .progress-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    min-width: 50px;
    text-align: right;
  }
}

.success-count {
  color: var(--el-color-success);
  font-weight: 600;
}

.fail-count {
  color: var(--el-color-danger);
  font-weight: 600;
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .field-tip-icon {
    font-size: 14px;
    color: var(--el-color-info);
    cursor: help;
    flex-shrink: 0;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
}

:deep(.el-table) {
  .blur-text {
    filter: blur(4px) !important;
    user-select: none !important;
  }
}
</style>