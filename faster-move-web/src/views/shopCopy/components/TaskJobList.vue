<template>
  <div>
    <div class="search-top">
      <div class="search-left">
        <div class="state-text">门店ID:</div>
        <el-input v-model="queryParams.NewShopOfficeId" class="filter-input" clearable placeholder="请输入门店ID"
          @change="getTaskList" @clear="getTaskList" />

        <div class="state-text">当前阶段:</div>
        <el-select v-model="currentStageModel" class="filter-select" clearable placeholder="请选择阶段"
          @change="getTaskList">
          <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="state-text">任务状态:</div>
        <el-select v-model="jobStatusModel" class="filter-select" clearable placeholder="请选择状态" @change="getTaskList">
          <el-option v-for="item in jobStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="state-text">排序方式:</div>
        <el-select v-model="queryParams.SortType" class="filter-select" placeholder="请选择排序方式" @change="getTaskList">
          <el-option v-for="item in sortTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="search-right">
        <div class="auto-refresh-control">
          <el-switch v-model="autoRefreshEnabled" active-text="自动刷新" @change="handleAutoRefreshChange" />
          <span v-if="autoRefreshEnabled" class="refresh-countdown">
            {{ countdownText }}
          </span>
        </div>
      </div>
    </div>
    <div class="table-main">
      <el-table v-loading="tableLoading" :data="tableData" height="calc(100vh - 400px)" :style="{ width: '100%' }">

        <el-table-column label="老店信息" width="260">
          <template #default="{ row }">
            <div v-if="row.OldShop" class="shop-info">
              <div class="shop-avatar">
                <img v-if="hasShopImg(row.OldShop.ShopImg)" :src="row.OldShop.ShopImg" alt="老店头像" />
                <div v-else class="shop-avatar__placeholder">{{ getShopInitial(row.OldShop.ShopName) }}</div>
              </div>
              <div class="shop-info__text">
                <div class="shop-info__name shop-info__name--clickable" @click="openShopBackend(row.OldShop)">
                  <ShopNameWithIcon :shop-name="row.OldShop.ShopName" :shop-type="row.OldShop.ShopType"
                    :class="{ 'blur-text': demoMode }" />
                </div>
                <div class="shop-info__id">ID: <span :class="{ 'blur-text': demoMode }">{{ row.OldShop.OfficeId
                    }}</span></div>
              </div>
            </div>
            <div v-else style="color: #999;">-</div>
          </template>
        </el-table-column>
        <el-table-column label="新店信息" width="260">
          <template #default="{ row }">
            <div v-if="row.NewShop" class="shop-info">
              <div class="shop-avatar">
                <img v-if="hasShopImg(row.NewShop.ShopImg)" :src="row.NewShop.ShopImg" alt="新店头像" />
                <div v-else class="shop-avatar__placeholder">{{ getShopInitial(row.NewShop.ShopName) }}</div>
              </div>
              <div class="shop-info__text">
                <div class="shop-info__name shop-info__name--clickable" @click="openShopBackend(row.NewShop)">
                  <ShopNameWithIcon :shop-name="row.NewShop.ShopName" :shop-type="row.NewShop.ShopType"
                    :class="{ 'blur-text': demoMode }" />
                </div>
                <div class="shop-info__id">ID: <span :class="{ 'blur-text': demoMode }">{{ row.NewShop.OfficeId
                    }}</span></div>
              </div>
            </div>
            <div v-else style="color: #999;">-</div>
          </template>
        </el-table-column>
        <el-table-column label="所有阶段" width="280">
          <template #default="{ row }">
            <div v-if="row.TaskStages && row.TaskStages.length > 0" class="task-stages">
              <template v-for="(stage, index) in row.TaskStages" :key="index">
                <el-tag :type="getStageTagType(stage, row.CurrentStage, row.TaskStages)" size="small" class="stage-tag">
                  {{ FoodMoveTaskStage[stage] }}
                </el-tag>
                <span v-if="Number(index) < row.TaskStages.length - 1" class="stage-arrow">→</span>
              </template>
            </div>
            <div v-else style="color: #999;">-</div>
          </template>
        </el-table-column>
        <el-table-column label="当前阶段" width="220">
          <template #default="{ row }">
            <div v-if="row.CurrentStage !== null && row.CurrentStage !== undefined">
              <div>{{ FoodMoveTaskStage[row.CurrentStage] }}</div>
              <div v-if="row.Remark" class="current-stage__remark">
                {{ row.Remark }}
              </div>
            </div>
            <div v-else style="color: #999;">-</div>
          </template>
        </el-table-column>
        <el-table-column label="任务状态" width="120">
          <template #default="{ row }">
            <div class="status-cell">
              <el-tag :type="getJobStatusType(row.JobStatus)">
                {{ getJobStatusLabel(row.JobStatus) }}
              </el-tag>
              <div v-if="row.JobErrMsg" class="task-error">
                {{ row.JobErrMsg }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <div>
              <el-progress :percentage="row.CurrPercent" :status="getProgressStatus(row.JobStatus)" />
              <div style="font-size: 12px; color: #999; margin-top: 4px;">
                成功: {{ row.SuccessCount }} / 失败: {{ row.FailCount }} / 总计: {{ row.Total }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            <div v-if="row.CreateTime" style="font-size: 13px; color: #606266;">
              {{ formatDateTime(row.CreateTime) }}
            </div>
            <div v-else style="color: #999;">-</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="goMoveShop(row)">进店搬菜</el-button>
            <el-button type="text" style="color: #f56c6c;" @click="handleCancelTaskJobs(row)">取消任务</el-button>
            <el-button type="text" style="color: #f56c6c;" @click="handleDeleteTask(row)">删除任务</el-button>
            <template v-if="isAdmin">
              <el-button type="text" style="color: #e6a23c;"
                @click="handleMarkAsManualProcessing(row, true)">标记人工处理</el-button>
              <el-button type="text" style="color: #909399;"
                @click="handleMarkAsManualProcessing(row, false)">取消人工处理</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex;justify-content: flex-end;margin-top: 20px;">
        <vab-pagination :current-page="queryParams.page" :page-size="queryParams.pageSize" :total="total"
          @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gp } from '/@vab/plugins/vab.ts'
import { ElMessageBox } from 'element-plus'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { FoodMoveTaskApi } from '/@/TsModel/Api/Alien/Faster/Controllers/FoodMove/FoodMoveTaskApi'
import type { GetTaskJobListRequestVo } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/GetTaskJobListRequestVo'
import type { TaskJobItemInfoResultVo } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/TaskJobItemInfoResultVo'
import { FoodMoveTaskStage } from '/@/TsModel/Alien/Entity/Enums/FoodMoveTaskStage'
import { JobStatus } from '/@/TsModel/Alien/Entity/Enums/JobStatus'
import { TaskListSortType } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/TaskListSortType'
import { CreateTaskTypeEnum } from '/@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import ShopNameWithIcon from '/@/views/shop/componentsV2/ShopNameWithIcon.vue'
import { openShopWindow } from '/@/utils/openShopWin'
import { useAclStore } from '/@/store/modules/acl'
import type { MarkTaskStateVo } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/MarkTaskStateVo'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  taskType: CreateTaskTypeEnum
  newShopType: ShopType
}>()

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const emit = defineEmits<{
  (
    e: 'moveShop',
    data: {
      taskId: string
      taskType: CreateTaskTypeEnum
      oldShop?: any
      newShop?: any
      oldShopReady?: boolean
    }
  ): void
}>()

// 获取权限store，用于判断是否为管理员
const aclStore = useAclStore()

// 判断是否为管理员：role 数组中包含 "ADMIN" 即为管理员
const isAdmin = computed(() => {
  return Array.isArray(aclStore.getRole) && aclStore.getRole.includes('ADMIN')
})

// 自动刷新相关
// 生成唯一的存储 key，基于任务类型和新店类型
const getAutoRefreshStorageKey = (): string => {
  return `taskJobList_autoRefresh_${props.taskType}_${props.newShopType}`
}

// 从 localStorage 读取自动刷新状态
const loadAutoRefreshState = (): boolean => {
  try {
    const stored = localStorage.getItem(getAutoRefreshStorageKey())
    return stored === 'true'
  } catch {
    return false
  }
}

// 保存自动刷新状态到 localStorage
const saveAutoRefreshState = (enabled: boolean): void => {
  try {
    localStorage.setItem(getAutoRefreshStorageKey(), String(enabled))
  } catch {
    // 忽略存储错误
  }
}

const autoRefreshEnabled = ref(loadAutoRefreshState())
const refreshInterval = ref(10) // 默认10秒刷新一次
const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null

const tableData = ref<TaskJobItemInfoResultVo[]>([])
const total = ref(0)
const tableLoading = ref(false)

// 直接复用 apiManager 的 axios 实例，保持拦截器行为一致
const axiosInstance = apiManager.getAxiosInstance()
const baseUrl = axiosInstance.defaults.baseURL || ''
const foodMoveTaskApi = new FoodMoveTaskApi(axiosInstance, baseUrl)

// 任务状态中文映射
const jobStatusLabelMap: Record<JobStatus, string> = {
  [JobStatus.Pending]: '待处理',
  [JobStatus.Enqueued]: '已排队',
  [JobStatus.Processing]: '处理中',
  [JobStatus.Succeeded]: '成功',
  [JobStatus.Scheduled]: '已计划',
  [JobStatus.Deleted]: '已删除',
  [JobStatus.Failed]: '失败',
}

// 获取任务状态中文标签
const getJobStatusLabel = (status: JobStatus): string => {
  return jobStatusLabelMap[status] || '未知'
}

/**
 * 格式化日期时间
 * @param dateTime 日期时间
 * @returns 格式化后的字符串 MM-DD HH:mm
 */
const formatDateTime = (dateTime: Date | string | null | undefined): string => {
  if (!dateTime) return '-'
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  if (isNaN(date.getTime())) return '-'
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 过滤枚举，只返回有效的选项（排除数字键和 None 项）
// 对于数字枚举，Object.keys() 会返回数字键和字符串键，我们需要过滤掉纯数字的键
const getEnumOptions = (enumObj: any): Array<{ label: string; value: number }> => {
  const options: Array<{ label: string; value: number }> = []
  // 使用 Object.entries 遍历，更清晰
  Object.entries(enumObj).forEach(([key, value]) => {
    // 只处理：键是字符串（不是纯数字），值是数字的情况，并且排除 None 项
    // 这样可以排除数字键（如 '0', '1'）、字符串值（如 'None'）和 None 键
    if (isNaN(Number(key)) && typeof value === 'number' && key !== 'None') {
      options.push({
        label: key, // 使用键名作为标签（中文）
        value: value as number,
      })
    }
  })
  // 按值排序，确保顺序正确
  return options.sort((a, b) => a.value - b.value)
}

// 阶段选项
const stageOptions = computed(() => getEnumOptions(FoodMoveTaskStage))

// 任务状态选项（使用中文）
const jobStatusOptions = computed(() => {
  const options: Array<{ label: string; value: number }> = []
  Object.entries(JobStatus).forEach(([key, value]) => {
    // 只处理：键是字符串（不是纯数字），值是数字的情况，并且排除 None 项
    if (isNaN(Number(key)) && typeof value === 'number' && key !== 'None') {
      options.push({
        label: jobStatusLabelMap[value as JobStatus],
        value: value as number,
      })
    }
  })
  // 按值排序，确保顺序正确
  return options.sort((a, b) => a.value - b.value)
})

// 排序方式选项
const sortTypeOptions = computed(() => getEnumOptions(TaskListSortType))

const queryParams = reactive<GetTaskJobListRequestVo>({
  TaskType: props.taskType,
  NewShopType: props.newShopType,
  NewShopOfficeId: '',
  CurrentStage: null,
  TaskName: null,
  JobStatus: null,
  SortType: TaskListSortType.最新创建时间,
  page: 1,
  pageSize: 20,
})

// 将可空字段转换为 Element Plus 可接受的绑定类型
const currentStageModel = computed<FoodMoveTaskStage | undefined>({
  get: () => queryParams.CurrentStage ?? undefined,
  set: (value) => {
    queryParams.CurrentStage = value ?? null
  }
})

const jobStatusModel = computed<JobStatus | undefined>({
  get: () => queryParams.JobStatus ?? undefined,
  set: (value) => {
    queryParams.JobStatus = value ?? null
  }
})

// 获取任务列表
const getTaskList = async () => {
  tableLoading.value = true
  try {
    const result = await foodMoveTaskApi.GetTaskJobList(queryParams)
    const pageResult: any = (result as any)?.rows ? result : (result as any)?.data
    tableData.value = pageResult?.rows || pageResult?.Rows || []
    total.value = pageResult?.total || pageResult?.Total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取任务列表失败', 'error', 'hey')
  } finally {
    tableLoading.value = false
  }
}

// 获取任务状态标签类型
const getJobStatusType = (status: JobStatus): 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined => {
  switch (status) {
    case JobStatus.Succeeded:
      return 'success'
    case JobStatus.Failed:
      return 'danger'
    case JobStatus.Processing:
      return 'warning'
    case JobStatus.Pending:
    case JobStatus.Enqueued:
      return 'info'
    default:
      return undefined
  }
}

// 获取进度条状态
const getProgressStatus = (status: JobStatus): '' | 'success' | 'warning' | 'exception' | undefined => {
  if (status === JobStatus.Failed) {
    return 'exception'
  }
  if (status === JobStatus.Succeeded) {
    return 'success'
  }
  return undefined
}

// 判断店铺是否存在可用头像
const hasShopImg = (img?: string | null): boolean => {
  return !!(typeof img === 'string' && img.trim().length > 0)
}

// 获取店铺名首字符作为占位
const getShopInitial = (name?: string | null): string => {
  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim().charAt(0)
  }
  return '店'
}

// 获取阶段标签类型
const getStageTagType = (
  stage: FoodMoveTaskStage,
  currentStage: FoodMoveTaskStage | null | undefined,
  taskStages?: FoodMoveTaskStage[] | null
): 'success' | 'warning' | 'info' | 'primary' | 'danger' | undefined => {
  if (currentStage === null || currentStage === undefined) {
    return undefined
  }

  // Stage order should follow TaskStages from backend; fallback to enum numeric value when order missing
  if (Array.isArray(taskStages) && taskStages.length > 0) {
    const currentStageIndex = taskStages.findIndex((item) => item === currentStage)
    const targetIndex = taskStages.findIndex((item) => item === stage)

    if (currentStageIndex !== -1 && targetIndex !== -1) {
      if (currentStageIndex === targetIndex) {
        return 'warning' // 当前阶段高亮为黄色
      }
      if (targetIndex < currentStageIndex) {
        return 'success' // 当前阶段之前的阶段标记为绿色
      }
      return 'info' // 当前阶段之后的阶段保持灰色
    }
  }

  if (stage === currentStage) {
    return 'warning'
  }
  if (currentStage > stage) {
    return 'success'
  }
  return 'info'
}

// 倒计时文本
const countdownText = computed(() => {
  if (countdown.value <= 0) {
    return '刷新中...'
  }
  return `${countdown.value}秒后刷新`
})

// 处理自动刷新开关变化
const handleAutoRefreshChange = (enabled: string | number | boolean) => {
  const isEnabled = Boolean(enabled)
  // 保存状态到 localStorage
  saveAutoRefreshState(isEnabled)
  if (isEnabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh() // 先清除之前的定时器
  countdown.value = refreshInterval.value
  // 启动倒计时定时器
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      // 倒计时结束，执行刷新
      getTaskList().finally(() => {
        // 刷新完成后重置倒计时
        if (autoRefreshEnabled.value) {
          countdown.value = refreshInterval.value
        }
      })
    }
  }, 1000)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
}

// 分页处理
const handleSizeChange = (value: number) => {
  queryParams.page = 1
  queryParams.pageSize = value
  getTaskList()
}

const handleCurrentChange = (value: number) => {
  queryParams.page = value
  getTaskList()
}

/**
 * 取消任务
 * 取消所有托管任务的执行
 */
const handleCancelTaskJobs = async (row: TaskJobItemInfoResultVo) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消任务"${row.TaskName}"吗？此操作将取消该任务的所有托管任务执行。`,
      '取消确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await foodMoveTaskApi.CancelAllJobs(row.TaskId)
    gp.$baseMessage('任务取消成功', 'success', 'hey')

    // 刷新列表
    await getTaskList()
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '取消任务失败', 'error', 'hey')
    }
  }
}

/**
 * 删除任务
 * 弹出确认对话框后删除指定的任务
 */
const handleDeleteTask = async (row: TaskJobItemInfoResultVo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${row.TaskName}"吗？此操作将永久删除该任务及其所有相关数据，且无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: false,
      }
    )

    await foodMoveTaskApi.DeleteTask(row.TaskId)
    gp.$baseMessage('任务删除成功', 'success', 'hey')

    // 刷新列表
    await getTaskList()
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '删除任务失败', 'error', 'hey')
    }
  }
}

/**
 * 标记或取消标记任务为人工处理状态
 * @param row 任务行数据
 * @param isManualProcessing true-标记为人工处理；false-取消人工处理标记
 */
const handleMarkAsManualProcessing = async (row: TaskJobItemInfoResultVo, isManualProcessing: boolean) => {
  try {
    const action = isManualProcessing ? '标记为人工处理' : '取消人工处理标记'
    const description = isManualProcessing
      ? `标记后该任务将不会被自动删除，需要人工介入处理。`
      : `取消标记后任务将恢复正常状态，可以被自动删除。`

    await ElMessageBox.confirm(
      `确定要${action}任务"${row.TaskName}"吗？${description}`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const vo: MarkTaskStateVo = {
      TaskId: row.TaskId,
      IsManualProcessing: isManualProcessing,
    }

    await foodMoveTaskApi.MarkTaskAsManualProcessing(vo)
    gp.$baseMessage(`${action}成功`, 'success', 'hey')

    // 刷新列表
    await getTaskList()
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      const action = isManualProcessing ? '标记为人工处理' : '取消人工处理标记'
      gp.$baseMessage(error?.message || `${action}失败`, 'error', 'hey')
    }
  }
}

/**
 * 打开店铺后台
 * 将任务列表中的店铺信息转换为打开店铺所需的格式
 */
const openShopBackend = async (shop: any) => {
  if (!shop) {
    return
  }

  // 将任务列表中的店铺数据转换为 openShopWindow 需要的格式
  const shopData = {
    id: shop.ShopId,
    office_id: shop.OfficeId,
    shop_type: shop.ShopType,
    name: shop.ShopName,
    state: undefined // 任务列表中的店铺数据可能没有 state，让 openShopWindow 内部处理
  }

  await openShopWindow(shopData)
}

// 进店搬菜
const goMoveShop = async (row: TaskJobItemInfoResultVo) => {
  let oldShopReady = true
  // 检查老店数据准备情况，仅作为提示，不阻塞页面展示
  try {
    oldShopReady = await apiManager.foodmoveApi.IsOldShopDataReady(row.TaskId)
    if (!oldShopReady) {
      gp.$baseMessage('老店数据尚未准备好，请稍后再试', 'warning', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage(error?.message || '检查老店数据状态失败', 'error', 'hey')
    return
  }

  // 根据任务类型跳转
  emit('moveShop', {
    taskId: row.TaskId,
    taskType: props.taskType,
    oldShopReady,
    oldShop: row.OldShop
      ? {
        id: row.OldShop.ShopId,
        name: row.OldShop.ShopName,
        office_id: row.OldShop.OfficeId,
        shop_type: row.OldShop.ShopType,
        img: row.OldShop.ShopImg || '',
      }
      : undefined,
    newShop: row.NewShop
      ? {
        id: row.NewShop.ShopId,
        name: row.NewShop.ShopName,
        office_id: row.NewShop.OfficeId,
        shop_type: row.NewShop.ShopType,
        img: row.NewShop.ShopImg || '',
      }
      : undefined,
  })
}

// 初始化加载
onMounted(() => {
  getTaskList()
  // 如果之前开启了自动刷新，恢复自动刷新功能
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.search-top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .search-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    .filter-input {
      width: 200px;
    }

    .filter-select {
      width: 150px;
    }

    .state-text {
      margin: 0 5px;
      font-size: 12px;
      white-space: nowrap;
    }
  }

  .search-right {
    display: flex;
    align-items: center;
  }
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .shop-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #f5f5f5;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #909399;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e6ebf5;
      color: #606266;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }

  .shop-info__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .shop-info__name {
    font-size: 14px;
    color: #303133;

    &--clickable {
      cursor: pointer;
      color: var(--el-color-primary);
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }
  }

  .shop-info__id {
    font-size: 12px;
    color: #909399;
  }
}

.task-error {
  margin-top: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.task-stages {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  .stage-tag {
    margin: 0;
  }

  .stage-arrow {
    color: #909399;
    font-size: 14px;
    margin: 0 2px;
    flex-shrink: 0;
  }
}

.current-stage__remark {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.auto-refresh-control {
  display: flex;
  align-items: center;
  gap: 10px;

  .refresh-countdown {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
  }
}

:deep(.blur-text) {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
</style>