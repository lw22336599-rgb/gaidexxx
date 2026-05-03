<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :modal="false" modal-class="dialog-model" title="创建托管任务"
    width="70%" @close="handleClose">
    <div v-loading="loading">
      <el-row :gutter="20">
        <!-- 左侧：分组选择区域 -->
        <el-col :span="7">
          <div class="section-panel">
            <div class="active-title">选择要同步的分组(默认所有分组)</div>
            <div v-if="groupList.length === 0 && !loading" class="empty-tip">
              暂无分组数据，请先获取数据
            </div>
            <div v-else class="group-selection">
              <div class="selection-header">
                <el-checkbox v-model="selectAllGroups" @change="(val) => handleSelectAllGroups(!!val)">全选</el-checkbox>
                <span class="selection-count">已选择 {{ selectedGroupIds.length }} 个分组</span>
              </div>
              <div class="group-list">
                <el-checkbox-group v-model="selectedGroupIds">
                  <GroupTreeItem v-for="group in groupList" :key="group.id" :group="group" />
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧：配置区域 -->
        <el-col :span="17">
          <div class="section-panel">
            <div class="active-title">复制配置(如不明白保持默认即可)</div>
            <el-form class="copyconf-form" :model="copyConf" label-width="auto">
              <el-form-item label="同步库存">
                <el-switch v-model="copyConf.SyncStock"></el-switch>
                <span class="msg_copyconf">未打开默认9999</span>
              </el-form-item>
              <el-form-item label="同步老店上下架状态">
                <el-switch v-model="copyConf.SyncOnSale"></el-switch>
                <span class="msg_copyconf">未打开默认全上架</span>
              </el-form-item>
              <el-form-item>
                <template #label>
                  <span>商品类目(平台推荐)</span>
                  <el-tooltip content="因商品类目问题报错可修改此开关状态尝试继续复制" placement="top">
                    <el-icon style="margin-left: 4px; cursor: help;">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </template>
                <el-switch v-model="copyConf.CategoryUseRecomend" />
                <span class="msg_copyconf">未打开使用系统AI映射</span>
              </el-form-item>
              <el-form-item v-if="showRemoveWaterMark" label="智能去水印">
                <el-switch v-model="copyConf.RemoveWaterMark"></el-switch>
                <span class="msg_copyconf">美团菜品右下角有多层水印建议开启</span>
              </el-form-item>
              <el-form-item label="⚠️搬家之前重置新店⚠️">
                <el-switch v-model="copyConf.ResetNewShop"
                  @change="(val) => handleResetNewShopChange(!!val)"></el-switch>
                <span class="msg_copyconf" style="color: red;">开启后将清空新店所有商品⚠️⚠️⚠️</span>
              </el-form-item>

              <el-form-item label="同步装修">
                <el-switch v-model="copyConf.SyncDecoration"></el-switch>
                <span class="msg_copyconf">同步店招、海报等装修信息</span>
              </el-form-item>
              <el-form-item label="同步活动列表">
                <el-switch v-model="copyConf.SyncActivitys"></el-switch>
                <span class="msg_copyconf">开启后可选择要同步的活动类型</span>
              </el-form-item>
              <!-- <el-form-item v-if="copyConf.SyncActivitys" label="选择活动类型">
                <el-select v-model="selectedActivityTypes" multiple placeholder="请选择要同步的活动类型" style="width: 100%">
                  <el-option v-for="activity in activityTypeOptions" :key="activity.value" :label="activity.label"
                    :value="activity.value">
                  </el-option>
                </el-select>
                <span class="msg_copyconf">不选择则同步全部活动</span>
              </el-form-item> -->

            </el-form>
            <el-form v-if="shopType === 6" class="copyconf-form" :model="otherConf" label-width="auto">
              <el-form-item label="使用表格方式上传">
                <el-switch v-model="otherConf.use_excel" @change="handleExcelChange"></el-switch>
                <span class="msg_copyconf">
                  适用老版京东后台
                  <span class="view-link" @click="showJdImageDialog('old')">点击查看</span>
                </span>
              </el-form-item>
              <el-form-item label="京东新版后台">
                <el-switch v-model="otherConf.use_newjd" @change="handleNewJdChange"></el-switch>
                <span class="msg_copyconf">
                  适用新版京东后台
                  <span class="view-link" @click="showJdImageDialog('new')">点击查看</span>
                </span>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
    </div>
    <!-- 重置新店确认对话框 -->
    <el-dialog v-model="resetNewShopConfirmVisible" :close-on-click-modal="false" :modal="false"
      modal-class="dialog-model" title="确认重置新店" width="40%">
      <div style="font-size: 14px; line-height: 1.8">
        <p style="color: #e02020; font-weight: bold; margin-bottom: 15px">警告：此操作非常危险，请谨慎操作！</p>
        <p>开启"开始搬家之前重置新店"后，系统将清空新店所有现有商品。</p>
        <p style="color: #e02020; font-weight: bold;">此操作不可逆，请确认您已充分了解此操作的影响！</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleResetNewShopCancel">取 消</el-button>
          <el-button :disabled="resetNewShopCountDown > 0" type="danger" @click="handleResetNewShopConfirm">
            <span v-if="resetNewShopCountDown > 0">确认 ({{ resetNewShopCountDown }})</span>
            <span v-else>确 定</span>
          </el-button>
        </span>
      </template>
    </el-dialog>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button :loading="creating" type="primary" @click="handleCreate">创建任务</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 京东后台示例图片弹窗 -->
  <el-dialog v-model="jdImageDialogVisible" :title="jdImageDialogTitle" width="600px" :close-on-click-modal="true">
    <div style="text-align: center;">
      <img :src="jdImageUrl" style="max-width: 100%; max-height: 600px;" alt="京东后台示例图" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { FoodMoveTaskApi } from '/@/TsModel/Api/Alien/Faster/Controllers/FoodMove/FoodMoveTaskApi'
import type { FoodGroupItem } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem'
import type { CreateFdmvTasJobkVo } from '/@/TsModel/Alien/Faster/Controllers/FoodMove/CreateFdmvTasJobkVo'
import type { FoodMoveConf } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConf'
import { ActivityType } from '/@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType'
import { CreateTaskTypeEnum } from '/@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum'
import { createTask } from '/@/api/foodMove'
import axios from 'axios'
import { useUserStore } from '/@/store/modules/user'
import GroupTreeItem from './GroupTreeItem.vue'
import jdOldImage from '/@/icon/jdupload/old.png'
import jdNewImage from '/@/icon/jdupload/new.png'

const props = defineProps<{
  modelValue: boolean
  taskId?: string | null
  shopData: any
  oldShop?: any | null
  competitorShopId?: string | null
  competitorShopType?: number | null
  taskType?: CreateTaskTypeEnum | number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const creating = ref(false)
const groupList = ref<FoodGroupItem[]>([])
const selectedGroupIds = ref<string[]>([])
const selectedActivityTypes = ref<ActivityType[]>([])
const indexSet = ref(false)
const resetNewShopConfirmVisible = ref(false)
const resetNewShopCountDown = ref(5)
const resetNewShopCountDownTimer = ref<NodeJS.Timeout | null>(null)

// 活动类型选项（从枚举中获取）
const activityTypeOptions = [
  { label: '满减活动', value: ActivityType.满减活动 },
  { label: '减配送费', value: ActivityType.减配送费 },
  { label: '折扣活动', value: ActivityType.折扣活动 },
  { label: '门店新客立减', value: ActivityType.门店新客立减 },
  { label: '买赠活动', value: ActivityType.买赠活动 },
  { label: '收藏有礼', value: ActivityType.收藏有礼 },
  { label: '集点返卷', value: ActivityType.集点返卷 },
  { label: '下单返卷', value: ActivityType.下单返卷 },
  { label: '店内领卷', value: ActivityType.店内领卷 },
  { label: '超值换购', value: ActivityType.超值换购 }
]

const shopType = computed(() => props.shopData?.shop_type || 1)

const copyConf = ref<{
  SyncStock: boolean
  SyncOnSale: boolean
  CategoryUseRecomend: boolean
  attr_recomend: boolean
  attr_recomend_s: number
  RemoveWaterMark: boolean
  ResetNewShop: boolean
  KeepNewShops: boolean
  SyncDecoration: boolean
  SyncActivitys: boolean
  MaxThreads: number
  OtherConf: string
}>({
  SyncStock: true,  // 同步库存 - 默认开启
  SyncOnSale: true,
  CategoryUseRecomend: true,  // 商品类目用推荐模式 - 默认开启
  attr_recomend: true,
  attr_recomend_s: 60,
  RemoveWaterMark: true,
  ResetNewShop: false,
  KeepNewShops: true,
  SyncDecoration: false,
  SyncActivitys: true,
  MaxThreads: 50,
  OtherConf: ''
})

const otherConf = ref<{
  use_excel: boolean
  use_newjd: boolean
}>({
  use_excel: false,
  use_newjd: false
})

/**
 * 处理"使用表格方式上传"开关变化
 * 如果开启，则关闭"京东新版后台"
 */
const handleExcelChange = (value: boolean | string | number) => {
  if (value) {
    otherConf.value.use_newjd = false
    console.log('开启表格方式上传，自动关闭京东新版后台')
  }
}

/**
 * 处理"京东新版后台"开关变化
 * 如果开启，则关闭"使用表格方式上传"
 */
const handleNewJdChange = (value: boolean | string | number) => {
  if (value) {
    otherConf.value.use_excel = false
    console.log('开启京东新版后台，自动关闭表格方式上传')
  }
}

// 京东后台示例图片弹窗相关
const jdImageDialogVisible = ref(false)
const jdImageDialogTitle = ref('')
const jdImageUrl = ref('')

/**
 * 显示京东后台示例图片弹窗
 * @param type 'old' 老版后台 或 'new' 新版后台
 */
const showJdImageDialog = (type: 'old' | 'new') => {
  if (type === 'old') {
    jdImageDialogTitle.value = '老版京东后台示例'
    jdImageUrl.value = jdOldImage
  } else {
    jdImageDialogTitle.value = '新版京东后台示例'
    jdImageUrl.value = jdNewImage
  }
  jdImageDialogVisible.value = true
}

const selectAllGroups = computed({
  get: () => groupList.value.length > 0 && selectedGroupIds.value.length === groupList.value.length,
  set: (value) => {
    if (value) {
      selectedGroupIds.value = groupList.value.map(g => g.id)
    } else {
      selectedGroupIds.value = []
    }
  }
})

/**
 * 判断是否显示智能去水印选项
 * 只有源店铺为美团外卖(shop_type = 1)时才显示
 */
const showRemoveWaterMark = computed(() => {
  // 判断是竞对复制还是老到新复制
  const sourceShopType = props.taskType === CreateTaskTypeEnum.竞对复制
    ? (props.competitorShopType || 0)
    : (props.oldShop?.shop_type || 0)

  // 只有美团外卖(1)才显示智能去水印选项
  return sourceShopType === 1
})


// 获取 baseUrl
const getBaseUrl = () => {
  const localBaseUrl = localStorage.getItem('baseUrl')
  if (localBaseUrl) {
    try {
      const localBaseUrlObj = JSON.parse(localBaseUrl)
      if (localBaseUrlObj && localBaseUrlObj.default) {
        return localBaseUrlObj.default
      }
    } catch (error) {
      console.warn('解析 localStorage.baseUrl 失败:', error)
    }
  }
  return ''
}

// 创建 axios 实例
const baseUrl = getBaseUrl()
const axiosInstance = axios.create({
  baseURL: baseUrl,
})

// 设置拦截器
axiosInstance.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

const foodMoveTaskApi = new FoodMoveTaskApi(axiosInstance, baseUrl)

/**
 * 递归获取所有分组ID（包括子分组）
 */
const getAllGroupIds = (groups: FoodGroupItem[]): string[] => {
  const ids: string[] = []
  const traverse = (group: FoodGroupItem) => {
    ids.push(group.id)
    if (group.Children && group.Children.length > 0) {
      group.Children.forEach(child => traverse(child))
    }
  }
  groups.forEach(group => traverse(group))
  return ids
}

// 处理全选分组
const handleSelectAllGroups = (value: boolean) => {
  if (value) {
    selectedGroupIds.value = getAllGroupIds(groupList.value)
  } else {
    selectedGroupIds.value = []
  }
}

/**
 * 处理重置新店开关变化
 */
const handleResetNewShopChange = (value: boolean) => {
  if (value) {
    // 开启时显示确认对话框
    resetNewShopConfirmVisible.value = true
    resetNewShopCountDown.value = 5

    // 开始倒计时
    if (resetNewShopCountDownTimer.value) {
      clearInterval(resetNewShopCountDownTimer.value)
    }
    resetNewShopCountDownTimer.value = setInterval(() => {
      resetNewShopCountDown.value--
      if (resetNewShopCountDown.value <= 0) {
        if (resetNewShopCountDownTimer.value) {
          clearInterval(resetNewShopCountDownTimer.value)
          resetNewShopCountDownTimer.value = null
        }
      }
    }, 1000)
  } else {
    // 关闭时清理定时器
    if (resetNewShopCountDownTimer.value) {
      clearInterval(resetNewShopCountDownTimer.value)
      resetNewShopCountDownTimer.value = null
    }
  }
}

/**
 * 确认重置新店
 */
const handleResetNewShopConfirm = () => {
  if (resetNewShopCountDown.value > 0) {
    return
  }
  resetNewShopConfirmVisible.value = false
  if (resetNewShopCountDownTimer.value) {
    clearInterval(resetNewShopCountDownTimer.value)
    resetNewShopCountDownTimer.value = null
  }
}

/**
 * 取消重置新店
 */
const handleResetNewShopCancel = () => {
  resetNewShopConfirmVisible.value = false
  copyConf.value.ResetNewShop = false
  if (resetNewShopCountDownTimer.value) {
    clearInterval(resetNewShopCountDownTimer.value)
    resetNewShopCountDownTimer.value = null
  }
}

// 加载分组列表
const loadGroupList = async (taskId: string) => {
  loading.value = true
  try {
    const groups = await apiManager.foodmoveApi.GetOldShopGroupList(taskId)
    groupList.value = groups || []
  } catch (error: any) {
    ElMessage.error(error?.message || '获取分组列表失败')
    groupList.value = []
  } finally {
    loading.value = false
  }
}


// 创建任务（如果没有 taskId）
const createShopTask = async (): Promise<string | null> => {
  if (!props.shopData?.id) {
    throw new Error('请先选择新店')
  }

  // 判断是竞对复制还是老到新复制
  // 兼容两种枚举值：CreateTaskTypeEnum.竞对复制 (值为2) 或 CreateTaskTypeEnum.Competitor (值为2)
  const isCompetitor = (props.taskType === CreateTaskTypeEnum.竞对复制 || (props.taskType as any) === 2) || (!props.oldShop && props.competitorShopId)

  if (isCompetitor) {
    // 竞对复制
    if (!props.competitorShopId || !props.competitorShopType) {
      throw new Error('请先选择竞对店铺')
    }

    const res: any = await createTask({
      NewShop: props.shopData.id,
      OldShop: null,
      OldShopOffid: (props.competitorShopType === 1 ? '' : 'jd') + props.competitorShopId,
      OldShopType: props.competitorShopType,
      MaxThreads: copyConf.value.MaxThreads,
      KeepNewShops: copyConf.value.KeepNewShops,
      SyncStock: copyConf.value.SyncStock,
      SyncActivitys: copyConf.value.SyncActivitys,
      SyncOnSale: copyConf.value.SyncOnSale,
      CategoryUseRecomend: copyConf.value.CategoryUseRecomend,
      attr_recomend: copyConf.value.attr_recomend,
      attr_recomend_s: copyConf.value.attr_recomend_s,
      RemoveWaterMark: copyConf.value.RemoveWaterMark,
      TaskType: CreateTaskTypeEnum.竞对复制
    })

    if (res.code === 200 && res.data?.id) {
      return res.data.id
    }
    throw new Error('创建任务失败')
  } else {
    // 老到新复制
    if (!props.oldShop?.id) {
      throw new Error('请先选择新店和老店')
    }

    const res: any = await createTask({
      NewShop: props.shopData.id,
      OldShop: props.oldShop.id,
      MaxThreads: copyConf.value.MaxThreads,
      KeepNewShops: copyConf.value.KeepNewShops,
      SyncStock: copyConf.value.SyncStock,
      SyncActivitys: copyConf.value.SyncActivitys,
      SyncOnSale: copyConf.value.SyncOnSale,
      attr_recomend: copyConf.value.attr_recomend,
      attr_recomend_s: copyConf.value.attr_recomend_s,
      TaskType: CreateTaskTypeEnum.老到新复制
    })

    if (res.code === 200 && res.data?.id) {
      return res.data.id
    }
    throw new Error('创建任务失败')
  }
}

// 初始化数据
const initData = async () => {
  let currentTaskId = props.taskId

  // 如果没有 taskId，先创建任务
  if (!currentTaskId) {
    loading.value = true
    try {
      currentTaskId = await createShopTask()
      if (!currentTaskId) {
        ElMessage.error('创建任务失败')
        return
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '创建任务失败')
      return
    } finally {
      loading.value = false
    }
  }

  // 加载分组列表
  if (currentTaskId) {
    await loadGroupList(currentTaskId)
  }

  // 根据店铺类型设置默认值
  // 兼容两种枚举值：CreateTaskTypeEnum.竞对复制 (值为2) 或 CreateTaskTypeEnum.Competitor (值为2)
  const isCompetitor = (props.taskType === CreateTaskTypeEnum.竞对复制 || (props.taskType as any) === 2) || (!props.oldShop && props.competitorShopId)
  const t: number = isCompetitor
    ? (props.competitorShopType || 1)
    : (props.oldShop?.shop_type || 1)
  if (t === 3 || t === 4 || t === 5 || t === 7) {
    copyConf.value.RemoveWaterMark = false
  }
}

// 创建托管任务
const handleCreate = async () => {
  if (selectedGroupIds.value.length === 0) {
    // ElMessage.warning('请至少选择一个分组')
    // return
  }

  let currentTaskId = props.taskId

  // 如果没有 taskId，先创建任务
  if (!currentTaskId) {
    creating.value = true
    try {
      currentTaskId = await createShopTask()
      if (!currentTaskId) {
        ElMessage.error('创建任务失败')
        return
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '创建任务失败')
      return
    } finally {
      creating.value = false
    }
  }

  if (!currentTaskId) {
    ElMessage.error('任务ID不存在')
    return
  }

  creating.value = true
  try {
    // 组装 OtherConf
    let otherConfStr = ''
    if (shopType.value === 6) {
      const otherConfObj: any = {}
      if (otherConf.value.use_excel) {
        otherConfObj.use_excel = true
      }
      if (otherConf.value.use_newjd) {
        otherConfObj.use_newjd = true
      }
      if (Object.keys(otherConfObj).length > 0) {
        otherConfStr = JSON.stringify(otherConfObj)
      }
    }

    // 组装 FoodMoveConf
    const conf: FoodMoveConf = {
      OldShop: props.oldShop?.id || null,
      OldShopOffid: props.oldShop?.office_id || null,
      OldShopType: props.oldShop?.shop_type || null,
      OldShopName: props.oldShop?.name || null,
      NewShop: props.shopData.id,
      ResetNewShop: copyConf.value.ResetNewShop,
      SyncActivitys: copyConf.value.SyncActivitys,
      OnlyActivitys: copyConf.value.SyncActivitys && selectedActivityTypes.value.length > 0 ? selectedActivityTypes.value : null,
      SyncDecoration: copyConf.value.SyncDecoration,
      MaxThreads: copyConf.value.MaxThreads,
      TaskType: CreateTaskTypeEnum.老到新复制,
      SyncStock: copyConf.value.SyncStock,
      SyncOnSale: copyConf.value.SyncOnSale,
      CategoryUseRecomend: copyConf.value.CategoryUseRecomend,
      attr_recomend: copyConf.value.attr_recomend,
      attr_recomend_s: copyConf.value.attr_recomend_s,
      RemoveWaterMark: copyConf.value.RemoveWaterMark,
      OtherConf: otherConfStr || null
    }

    // 组装 CreateFdmvTasJobkVo
    const vo: CreateFdmvTasJobkVo = {
      TaskId: currentTaskId,
      Conf: conf,
      GroupIds: selectedGroupIds.value,
      IndexSet: indexSet.value
    }

    await foodMoveTaskApi.CreateFdmvTask(vo)
    ElMessage.success('创建托管任务成功')
    emit('created')
    handleClose()
  } catch (error: any) {
    ElMessage.error(error?.message || '创建托管任务失败')
  } finally {
    creating.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  // 重置数据
  selectedGroupIds.value = []
  selectedActivityTypes.value = []
  groupList.value = []
  indexSet.value = false
  resetNewShopConfirmVisible.value = false
  resetNewShopCountDown.value = 5
  if (resetNewShopCountDownTimer.value) {
    clearInterval(resetNewShopCountDownTimer.value)
    resetNewShopCountDownTimer.value = null
  }
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (resetNewShopCountDownTimer.value) {
    clearInterval(resetNewShopCountDownTimer.value)
    resetNewShopCountDownTimer.value = null
  }
})

// 监听弹窗打开
watch(visible, (newVal) => {
  if (newVal) {
    initData()
  }
})
</script>

<style scoped lang="scss">
.section-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.active-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.empty-tip {
  padding: 20px;
  text-align: center;
  color: #999;
}

.group-selection,
.activity-selection {
  flex: 1;
  display: flex;
  flex-direction: column;

  .selection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .selection-count {
    font-size: 14px;
    color: #666;
  }

  .group-list,
  .activity-list {
    flex: 1;
    max-height: 500px;
    overflow-y: auto;
    min-height: 200px;
  }

  .group-item,
  .activity-item {
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-info,
  .activity-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .group-name,
  .activity-name {
    font-size: 14px;
    color: #333;
  }

  .group-count,
  .activity-count {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
  }
}

.copyconf-form {
  flex: 1;
  overflow-y: auto;
  max-height: 500px;

  .msg_copyconf {
    margin-left: 10px;
    font-size: 12px;
    color: #999;
  }
}

.text-gray-500 {
  color: #666;
  margin-right: 10px;
}

.view-link {
  color: #409eff;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: underline;

  &:hover {
    color: #66b1ff;
  }
}
</style>