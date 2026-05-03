<template>
  <div class="food-manage">
    <!-- 进度条局部遮罩 -->
    <el-overlay v-if="showProgress" class="food-manage-overlay">
      <div class="progress-dialog">
        <ProgressBar ref="progressBarRef" :task-id="progressInfo.taskId" :request-id="progressInfo.requestId"
          :stream-method="progressInfo.streamMethod" :request-params="progressInfo.requestParams"
          :title="progressInfo.title" @complete="handleProgressComplete" @error="handleProgressError"
          @stop="handleProgressStop" />
      </div>
    </el-overlay>

    <div class="food-manage__left">
      <div class="button-actions">
        <el-button type="danger" @click="handlePullShopFoodsV2">
          重新拉取商品
        </el-button>
        <el-button type="primary" @click="handlePullShopAct">
          刷新活动
        </el-button>
      </div>
      <div class="tree-wrapper">
        <FoodGroupTree v-model:selectedGroups="selectedGroups" :groups="groups" @group-click="handleGroupClick"
          @load-group-foods="handleLoadGroupFoods" />
      </div>
    </div>
    <div class="food-manage__right">
      <div class="food-manage__header">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部商品" :name="0" />
          <el-tab-pane label="已售罄" :name="1" />
          <el-tab-pane label="已下架" :name="2" />
          <el-tab-pane label="活动商品" :name="3" />
          <el-tab-pane label="多规格商品" :name="4" />
        </el-tabs>
        <div class="search-form">
          <el-form :model="searchForm" inline>
            <el-form-item label="商品名">
              <el-input v-model="searchForm.ProductName" placeholder="请输入" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="价格区间">
              <el-input-number v-model="searchForm.MinPrice" placeholder="最低价" :min="0" style="width: 100px;"
                controls-position="right" />
              <span style="margin: 0 8px;">-</span>
              <el-input-number v-model="searchForm.MaxPrice" placeholder="最高价" :min="0" style="width: 100px;"
                controls-position="right" />
            </el-form-item>
            <el-form-item label="是否折扣">
              <el-select v-model="searchForm.IsDiscount" placeholder="是否折扣" clearable style="width: 120px;">
                <el-option :value="undefined" label="全部" />
                <el-option :value="true" label="是" />
                <el-option :value="false" label="否" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否上架">
              <el-select v-model="searchForm.IsOnSale" placeholder="是否上架" clearable style="width: 120px;">
                <el-option :value="undefined" label="全部" />
                <el-option :value="true" label="上架" />
                <el-option :value="false" label="下架" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="food-manage__content">
        <div class="operation-buttons">
          <div class="batch-operation-title">批量操作</div>
          <div class="button-group-wrapper">
            <el-button-group>
              <template v-if="props.tabType === 'batch-price'">
                <el-button type="primary" @click="handleUpdateName">调整商品名</el-button>
                <el-button type="primary" @click="handleUpdatePrice">调整原价</el-button>
                <el-button type="primary" @click="handleUpdateDiscount">调整折扣价</el-button>
                <el-button type="warning" @click="handleOfflineDiscount">批量下线折扣</el-button>
                <el-button type="primary" @click="handleUpdateStock">调整库存</el-button>
                <el-button type="primary" @click="handleUpdateStatus">调整上下架</el-button>
                <el-button type="warning" @click="handleUpdateMinBuy">设置起购</el-button>
                <el-button type="danger" @click="handleDelete">批量删除</el-button>
              </template>
              <template v-if="props.tabType === 'updat-foodimg'">
                <el-button type="danger" @click="handleUpdateImage">批量主图框</el-button>
                <el-button type="danger" @click="handleDeleteImage">批量删除主图</el-button>
              </template>
              <el-button type="warning" @click="handleRecover">恢复</el-button>
            </el-button-group>
            <el-checkbox v-model="syncSite">实时同步到平台</el-checkbox>
          </div>
        </div>
        <div class="table-wrapper" v-loading="loading" element-loading-text="正在加载商品数据..."
          element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-custom-class="food-table-loading">
          <FoodTable v-model:selectedFoods="selectedFoods" v-model:selectedFoodIds="selectedFoodIds"
            v-model:selectedSkus="selectedSkus" :foods="foods" :loading="loading" :task-id="taskId" :shop-id="shopId"
            :tab-type="props.tabType" :sync-site="syncSite" @update="handleFoodUpdate"
            @single-delete="handleSingleDelete" @update-price="handleUpdatePriceConfirm"
            @update-stock="handleUpdateStockConfirm" @update-discount="handleUpdateDiscountConfirm"
            @update-minbuy="handleUpdateMinBuyConfirm" @update-name="handleUpdateNameConfirm"
            @update-status="(params: FoodManageApi.BatchUpdateStatusParams) => handleUpdateStatusConfirm(params)"
            @recover="handleSingleRecover"
            @offline-discount="(params: FoodManageApi.BatchOfflineDiscountParams) => handleOfflineDiscountConfirm(params)" />
        </div>
        <div class="pagination-wrapper">
          <el-pagination v-model:current-page="pageIndex" :total="total" layout="total, prev, pager, next"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>

    <!-- 各种操作弹窗 -->
    <UpdateNameDialog v-model="dialogs.updateName.visible" :selected-count="selectedFoods.length" :shop-id="shopId"
      :task-id="taskId" @confirm="handleUpdateNameConfirm" />
    <UpdatePriceDialog v-model="dialogs.updatePrice.visible" :selected-count="selectedFoods.length" :shop-id="shopId"
      :task-id="taskId" @confirm="handleUpdatePriceConfirm" />
    <UpdateDiscountDialog v-model="dialogs.updateDiscount.visible" :selected-count="selectedFoods.length"
      :shop-id="shopId" :task-id="taskId" :targets="discountTargets" @confirm="handleUpdateDiscountConfirm" />
    <UpdateStockDialog v-model="dialogs.updateStock.visible" :selected-count="selectedFoods.length" :shop-id="shopId"
      :task-id="taskId" @confirm="handleUpdateStockConfirm" />
    <UpdateMinBuyDialog v-model="dialogs.updateMinBuy.visible" :selected-count="selectedFoods.length" :shop-id="shopId"
      :task-id="taskId" :selected-foods="selectedFoods" :selected-skus="selectedSkus"
      @confirm="handleUpdateMinBuyConfirm" />
    <UpdateImageDialog v-model="dialogs.updateImage.visible" :first-product-image="firstProductImage"
      :base-params="baseParams" :food-ids="selectedFoodIds" v-model:onlyMainImage="onlyMainImage"
      @confirm="handleUpdateImageConfirm" />
    <ConfirmDialog v-model="dialogs.confirm.visible" :title="dialogs.confirm.title" :content="dialogs.confirm.content"
      @confirm="dialogs.confirm.onConfirm" />
    <UpdateStatusDialog v-model="dialogs.updateStatus.visible" :selected-count="selectedFoods.length"
      @confirm="(params: FoodManageApi.BatchUpdateStatusParams) => handleUpdateStatusConfirm(params)" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FoodManageApi } from './types/api'
import { CreateTaskTypeEnum } from '/@/types/foodMove'
import {
  createTask,
  getFoodGroups,
  getFoodList,
  batchUpdatePrice,
  batchUpdateImage,
  batchDeleteFood,
  batchUpdateStatus,
  batchUpdateStock,
  batchUpdateDiscount,
  batchOfflineDiscount,
  batchUpdateMinBuy,
  batchUpdateName,
  progressTest,
  pullShopFoods,
  deleteFirstFoodImage,
  batchUpdateImageBorder,
  recoverFoods,
  pullShopFoodsV2,

  pullShopAct,
} from '/@/api/foodManage'
import FoodGroupTree from './components/FoodGroupTree.vue'
import FoodTable from './components/FoodTable.vue'
import UpdateNameDialog from './components/dialogs/UpdateNameDialog.vue'
import UpdatePriceDialog from './components/dialogs/UpdatePriceDialog.vue'
import UpdateDiscountDialog from './components/dialogs/UpdateDiscountDialog.vue'
import UpdateStockDialog from './components/dialogs/UpdateStockDialog.vue'
import UpdateMinBuyDialog from './components/dialogs/UpdateMinBuyDialog.vue'
import UpdateImageDialog from './components/dialogs/UpdateImageDialog.vue'
import ConfirmDialog from './components/dialogs/ConfirmDialog.vue'
import { ShopListItem } from '/@/types/shop'
import { PropType } from 'vue'
import ProgressBar from './components/ProgressBar.vue'
import UpdateStatusDialog from './components/dialogs/UpdateStatusDialog.vue'

const props = defineProps({
  shopData: {
    type: Object as PropType<ShopListItem>,
    required: true
  },
  //'batch-price'  或者 'updat-foodimg'
  tabType: {
    type: String,
    required: true
  }
})
const route = useRoute()
const shopId = ref('')
const toolType = computed(() => route.params.toolType as string)

const taskId = ref('')
const groups = ref<FoodManageApi.FoodGroupVoItem[]>([])
const selectedGroups = ref<string[]>([])
const foods = ref<FoodManageApi.FoodItemVo[]>([])
const selectedFoods = ref<string[]>([])
const selectedFoodIds = ref<string[]>([])
const selectedSkus = ref<{ Spu: string; SkuIds: string[] }[]>([])
const loading = ref(false)
const activeTab = ref(0)
const pageIndex = ref(1)
const total = ref(0)
const syncSite = ref(true)

// 添加店铺信息相关的状态
const shopData = ref<ShopListItem>({} as ShopListItem)

// 添加当前选中分组的响应式状态，使用office_id
const currentSelectedGroup = ref<string>('')

const searchForm = reactive({
  ProductName: '',
  MinPrice: 0,
  MaxPrice: 0,
  IsDiscount: undefined as boolean | undefined,
  IsOnSale: undefined as boolean | undefined,
})

const dialogs = reactive({
  updateName: {
    visible: false,
  },
  updatePrice: {
    visible: false,
  },
  updateDiscount: {
    visible: false,
  },
  updateStock: {
    visible: false,
  },
  updateMinBuy: {
    visible: false,
  },
  updateImage: {
    visible: false,
  },
  confirm: {
    visible: false,
    title: '',
    content: '',
    onConfirm: () => { },
  },
  updateStatus: {
    visible: false,
    status: true,
  },
})

const progressBarRef = ref()
const showProgress = ref(false)

// 进度条相关信息
const progressInfo = ref({
  taskId: '',
  requestId: '',
  streamMethod: progressTest,
  requestParams: {},
  title: '操作进度',
  taskType: ''
})

// 计算属性：弹窗用的Targets
const discountTargets = computed(() => {
  if (selectedSkus.value && selectedSkus.value.length > 0) {
    // 直接返回，不转换
    return selectedSkus.value
  }
  if (selectedFoods.value && selectedFoods.value.length > 0) {
    // 只转换 selectedFoods
    return selectedFoods.value.map(spu => ({
      Spu: spu,
      SkuIds: []
    }))
  }
  return []
})

// 根据操作类型设置流式响应方法和参数
const setStreamMethod = (type: string) => {
  switch (type) {
    case 'pullShopFoods':
      progressInfo.value = {
        taskId: taskId.value,
        requestId: `${taskId.value}_pullShopFoods`,
        streamMethod: (params: any, onProgress?: any, requestId?: string) =>
          pullShopFoods({ ...params, forcedPull: false }, onProgress, requestId),
        requestParams: {
          taskId: taskId.value
        },
        title: '商品同步进度',
        taskType: 'pullShopFoods'
      }
      break
    case 'progressTest':
    default:
      progressInfo.value = {
        taskId: taskId.value,
        requestId: `${taskId.value}_progressTest`,
        streamMethod: progressTest,
        requestParams: { taskId: taskId.value },
        title: '商品同步进度',
        taskType: 'progressTest'
      }
      break
  }
  console.log('设置进度信息:', progressInfo.value)
}

// 显示进度条并开始任务
const showProgressAndStartTask = async (method: (params: any, onProgress?: (progress: FoodManageApi.ProgressInfo) => void, requestId?: string) => Promise<any>, params: any, title: string, taskType: string = '') => {
  progressInfo.value = {
    taskId: taskId.value,
    requestId: `${taskId.value}_${method.name}`,
    streamMethod: (params: any, onProgress?: (progress: FoodManageApi.ProgressInfo) => void, requestId?: string) =>
      method(params, onProgress, requestId),
    requestParams: params,
    title,
    taskType
  }
  showProgress.value = true
  await nextTick()
  if (!progressBarRef.value) {
    ElMessage.error('进度条组件未初始化')
    return
  }
  await progressBarRef.value.startTask()
}

// 初始化
onMounted(async () => {
  try {
    // 获取店铺信息
    console.log(props.shopData)
    shopData.value = props.shopData;
    shopId.value = props.shopData.id;
    // 创建任务
    const res = await createTask({
      syncSite: true,
      OldShopType: 0,
      KeepNewShops: true,
      SyncActivitys: false,
      MaxThreads: 20,
      TaskType: CreateTaskTypeEnum.BatchManage,
      NewShop: shopId.value,
      SyncStock: true,
      SyncOnSale: true,
      CategoryUseRecomend: false,
      RemoveWaterMark: false,
      OldShop: shopId.value,
      OldShopName: shopData.value.name,
      OldShopOffid: shopData.value.office_id
    })
    taskId.value = res.data.id

    // 设置进度信息
    setStreamMethod('pullShopFoods')

    // 先显示进度条对话框
    showProgress.value = true

    // 等待对话框渲染完成
    await nextTick()

    // 确保组件已经挂载
    if (!progressBarRef.value) {
      ElMessage.error('进度条组件未初始化')
      return
    }

    // 开始任务
    await startNewTask()

    // 加载商品分组
    await loadFoodGroups()

    // 如果有当前选中的分组，则加载该分组的商品
    if (currentSelectedGroup.value) {
      handleLoadGroupFoods(currentSelectedGroup.value)
    }

  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败')
  }
})

// 开始新任务
const startNewTask = async (type: string = 'progressTest') => {
  try {
    await progressBarRef.value.startTask()
  } catch (error) {
    console.error('启动任务失败:', error)
    ElMessage.error('启动任务失败')
  }
}

// 加载分组
const loadFoodGroups = async () => {
  try {
    const res = await getFoodGroups(taskId.value)
    // 确保每个分组都有正确的数据结构
    groups.value = res.data.map(item => ({
      ...item,
      id: item.Group?.id || item.id,
      name: item.Group?.Name || item.name,
      children: []
    }))
  } catch (error) {
    ElMessage.error('加载分组失败')
  }
}

// 加载商品列表
const loadFoods = async () => {
  loading.value = true
  try {
    // 组装参数，过滤空值
    const params: FoodManageApi.GetFoodListParams = {
      TaskId: taskId.value,
      ShopId: shopId.value,
      GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : (currentSelectedGroup.value ? [currentSelectedGroup.value] : []),
      ProductName: searchForm.ProductName,
      TabType: activeTab.value as FoodManageApi.ProductTabType,
      Page: pageIndex.value,
      SyncSite: syncSite.value,
      MinPrice: searchForm.MinPrice || undefined,
      MaxPrice: searchForm.MaxPrice || undefined,
      IsDiscount: searchForm.IsDiscount,
      IsOnSale: searchForm.IsOnSale,
    }

    const res = await getFoodList(params)
    foods.value = res.data.rows
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 分组点击
const handleGroupClick = (group: FoodManageApi.FoodGroupVoItem) => {
  searchForm.ProductName = ''
  pageIndex.value = 1
  // 更新当前选中的分组，使用office_id
  const groupOffId = group.office_id || group.Group?.OfficeId
  if (groupOffId) {
    currentSelectedGroup.value = groupOffId
  }
}

// 加载指定分组的商品
const handleLoadGroupFoods = async (groupOffId: string) => {
  loading.value = true
  try {
    const params: FoodManageApi.GetFoodListParams = {
      TaskId: taskId.value,
      ShopId: shopId.value,
      GroupOffids: [groupOffId],
      ProductName: searchForm.ProductName,
      TabType: activeTab.value,
      Page: pageIndex.value,
      SyncSite: syncSite.value,
      IsDiscount: searchForm.IsDiscount === undefined ? undefined : (searchForm.IsDiscount === true ? true : false),
      IsOnSale: searchForm.IsOnSale === undefined ? undefined : (searchForm.IsOnSale === true ? true : false),
    }
    const res = await getFoodList(params)
    foods.value = res.data.rows
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// Tab点击
const handleTabClick = () => {
  pageIndex.value = 1
  // 将 activeTab.value 转换为 ProductTabType 类型
  const tabType = activeTab.value as FoodManageApi.ProductTabType
  loadFoods()
}

// 搜索
const handleSearch = () => {
  pageIndex.value = 1
  loadFoods()
}

// 重置
const handleReset = () => {
  // 重置搜索表单
  searchForm.ProductName = ''
  searchForm.MinPrice = 0
  searchForm.MaxPrice = 0
  searchForm.IsDiscount = undefined
  searchForm.IsOnSale = undefined

  // 重置页码
  pageIndex.value = 1

  // 重新加载数据
  loadFoods()
}

// 分页
const handleCurrentChange = (val: number) => {
  pageIndex.value = val
  loadFoods()
}

// 处理单个商品删除
const handleSingleDelete = (row: FoodManageApi.FoodItemVo) => {
  dialogs.confirm.visible = true
  dialogs.confirm.title = '删除商品'
  dialogs.confirm.content = `警告：此操作不可逆！\n确定要删除商品"${row.Name}"吗？\n删除后商品将立即从平台下架并删除，且无法恢复。`
  dialogs.confirm.onConfirm = async () => {
    try {
      await batchDeleteFood({
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
        FoodIds: selectedFoodIds.value,
      })
      ElMessage.success('删除成功')
      // 如果有当前选中的分组，则加载该分组的商品，否则加载全部商品
      if (currentSelectedGroup.value) {
        handleLoadGroupFoods(currentSelectedGroup.value)
      } else {
        loadFoods()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }
}

// 商品更新
const handleFoodUpdate = () => {
  // 如果只有一个商品被选中，且是从表格行操作触发的，则打开主图框对话框
  if (selectedFoodIds.value.length === 1) {
    dialogs.updateImage.visible = true
  }
}

// 调整商品名
const handleUpdateName = () => {
  showGroupOperationConfirm(
    '调整商品名',
    '确定要调整商品名称吗？',
    () => {
      dialogs.updateName.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateNameConfirm = async (params: Partial<FoodManageApi.UpdateFoodNameParms>) => {
  try {
    await showProgressAndStartTask(
      batchUpdateName,
      {
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
        FoodIds: params.FoodIds || selectedFoodIds.value,
        Mode: params.Mode ?? 0,
        Prefix: params.Prefix,
        Suffix: params.Suffix,
        OriginalText: params.OriginalText,
        ReplacementText: params.ReplacementText,
      },
      '修改商品名称',
      'updateName'
    )
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 调整原价
const handleUpdatePrice = () => {
  showGroupOperationConfirm(
    '调整原价',
    '确定要调整商品原价吗？',
    () => {
      dialogs.updatePrice.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdatePriceConfirm = async (params: FoodManageApi.UpdateFoodPriceParms) => {
  try {
    // 如果传入的 params 中已经有 Targets，则使用传入的 Targets
    const targets = Array.isArray(params.Targets) && params.Targets.length > 0
      ? params.Targets
      : selectedSkus.value.length > 0
        ? selectedSkus.value
        : selectedFoods.value.length > 0
          ? selectedFoods.value.map(spu => ({ Spu: spu, SkuIds: [] }))
          : undefined

    // 确定 GroupOffids：如果有选中的分组，只对选中的分组生效；如果没有选中的分组，设置为 null（只对选中的商品生效）
    const groupOffids = selectedGroups.value.length > 0 ? selectedGroups.value : null

    // 验证：如果没有选中分组，也没有选中商品，提示用户
    if (!groupOffids && (!targets || targets.length === 0)) {
      ElMessage.warning('请选择要修改价格的分组或商品')
      return
    }

    // 先关闭对话框
    dialogs.updatePrice.visible = false

    // 立即显示进度条，确保用户能看到加载状态
    progressInfo.value = {
      taskId: taskId.value,
      requestId: `${taskId.value}_batchUpdatePrice_${Date.now()}`,
      streamMethod: (params: any, onProgress?: (progress: FoodManageApi.ProgressInfo) => void, requestId?: string) =>
        batchUpdatePrice(params, onProgress, requestId),
      requestParams: {
        ...params,
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: groupOffids,
        Targets: groupOffids ? undefined : targets,
      },
      title: '正在修改商品价格',
      taskType: 'updatePrice'
    }
    showProgress.value = true

    // 等待 DOM 更新，确保进度条组件已渲染
    await nextTick()

    if (!progressBarRef.value) {
      ElMessage.error('进度条组件未初始化')
      showProgress.value = false
      return
    }

    // 开始任务
    await progressBarRef.value.startTask()
  } catch (error) {
    console.error('批量修改价格失败:', error)
    showProgress.value = false
    ElMessage.error('修改失败，请重试')
  }
}

// 调整折扣价
const handleUpdateDiscount = () => {
  showGroupOperationConfirm(
    '调整折扣价',
    '确定要调整商品折扣价吗？',
    () => {
      dialogs.updateDiscount.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateDiscountConfirm = async (params: FoodManageApi.BatchUpdateDiscountParams) => {
  try {
    await showProgressAndStartTask(
      batchUpdateDiscount,
      {
        ...params,
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
      },
      '修改商品折扣',
      'updateDiscount'
    )
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 批量下线折扣
const handleOfflineDiscount = () => {
  if (selectedFoods.value.length === 0 && selectedSkus.value.length === 0 && selectedGroups.value.length === 0) {
    ElMessage.warning('请选择商品、SKU或分组')
    return
  }

  showGroupOperationConfirm(
    '批量下线折扣',
    '确定要进行下线折扣操作吗？',
    async () => {
      try {
        // 构建 Targets
        const targets = selectedSkus.value.length > 0
          ? selectedSkus.value
          : selectedFoods.value.map(spu => ({
            Spu: spu,
            SkuIds: []
          }))

        await showProgressAndStartTask(
          batchOfflineDiscount,
          {
            TaskId: taskId.value,
            ShopId: shopId.value,
            SyncSite: syncSite.value,
            GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
            Targets: targets
          },
          '下线商品折扣',
          'offlineDiscount'
        )
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  )
}

// 添加处理单个商品下线折扣的函数
const handleOfflineDiscountConfirm = async (params: FoodManageApi.BatchOfflineDiscountParams) => {
  try {
    await showProgressAndStartTask(
      batchOfflineDiscount,
      params,
      '下线商品折扣',
      'offlineDiscount'
    )
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 调整库存
const handleUpdateStock = () => {
  showGroupOperationConfirm(
    '调整库存',
    '确定要调整商品库存吗？',
    () => {
      dialogs.updateStock.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateStockConfirm = async (params: FoodManageApi.BatchUpdateStockParams) => {
  try {
    // 如果传入了 Targets，优先使用传入的 Targets
    if (params.Targets && params.Targets.length > 0) {
      await showProgressAndStartTask(
        batchUpdateStock,
        {
          ...params,
          TaskId: taskId.value,
          ShopId: shopId.value,
          SyncSite: syncSite.value,
          GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
        },
        '修改商品库存',
        'updateStock'
      )
      return
    }

    // 检查是否有选中的商品或SKU
    if (selectedSkus.value.length === 0 && selectedFoods.value.length === 0) {
      ElMessage.warning('请选择要调整库存的商品或SKU')
      return
    }

    // 构建Targets
    const targets = selectedSkus.value.length > 0 ? selectedSkus.value : selectedFoods.value.map(spu => ({
      Spu: spu,
      SkuIds: []
    }))

    await showProgressAndStartTask(
      batchUpdateStock,
      {
        ...params,
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
        Targets: targets,
      },
      '修改商品库存',
      'updateStock'
    )
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 调整上下架
const handleUpdateStatus = () => {
  showGroupOperationConfirm(
    '调整上下架',
    '确定要调整商品上下架状态吗？',
    () => {
      dialogs.updateStatus.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateStatusConfirm = async (params: FoodManageApi.BatchUpdateStatusParams | Pick<FoodManageApi.BatchUpdateStatusParams, 'IsOnSale'>) => {
  try {
    console.log('index.vue - 接收到的状态值:', params.IsOnSale)
    // 兼容只传 IsOnSale 的情况
    const realParams: FoodManageApi.BatchUpdateStatusParams = {
      TaskId: taskId.value,
      ShopId: shopId.value,
      SyncSite: syncSite.value,
      GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
      // 如果 params 中有 FoodIds，则使用它，否则使用 selectedFoodIds
      FoodIds: ('FoodIds' in params && params.FoodIds) ? params.FoodIds : selectedFoodIds.value,
      IsOnSale: params.IsOnSale
    }

    // 验证 FoodIds 是否为空
    if ((!realParams.FoodIds || realParams.FoodIds.length === 0) && (!realParams.GroupOffids || realParams.GroupOffids.length === 0)) {
      ElMessage.error('商品ID不能为空')
      return
    }

    console.log('index.vue - 发送到后端的状态值:', realParams.IsOnSale)
    await showProgressAndStartTask(
      batchUpdateStatus,
      realParams,
      '修改商品状态',
      'updateStatus'
    )
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 设置起购
const handleUpdateMinBuy = () => {
  showGroupOperationConfirm(
    '设置起购',
    '确定要设置商品起购数量吗？',
    () => {
      dialogs.updateMinBuy.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateMinBuyConfirm = async (params: FoodManageApi.BatchUpdateMinBuyParams) => {
  try {
    await showProgressAndStartTask(
      batchUpdateMinBuy,
      {
        ...params,
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
      },
      '修改起购数量',
      'updateMinBuy'
    )
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 批量删除
const handleDelete = () => {
  showGroupOperationConfirm(
    '批量删除商品',
    '警告：此操作不可逆！\n确定要删除选中的商品吗？\n删除后商品将立即从平台下架并删除，且无法恢复。\n\n此操作将删除所有选中的商品，请再次确认是否继续？',
    async () => {
      try {
        await showProgressAndStartTask(
          batchDeleteFood,
          {
            TaskId: taskId.value,
            ShopId: shopId.value,
            SyncSite: syncSite.value,
            GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
            FoodIds: selectedFoodIds.value,
          },
          '删除商品',
          'delete'
        )
      } catch (error) {
        ElMessage.error('删除失败')
      }
    }
  )
}

// 批量主图框
const handleUpdateImage = () => {
  showGroupOperationConfirm(
    '批量主图框',
    '确定要调整商品主图框吗？',
    () => {
      dialogs.updateImage.visible = true
      return Promise.resolve()
    }
  )
}

const handleUpdateImageConfirm = async (params: FoodManageApi.BatchUpdateImageBorderParams) => {
  try {
    await showProgressAndStartTask(
      batchUpdateImageBorder,
      {
        ...params,
        TaskId: taskId.value,
        ShopId: shopId.value,
        SyncSite: syncSite.value,
        GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
      },
      '修改商品图片边框',
      'updateImage'
    )
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 批量删除主图
const handleDeleteImage = () => {
  showGroupOperationConfirm(
    '批量删除主图',
    '警告：此操作不可逆！\n确定要删除商品的第一张主图吗？\n注意：\n1. 只删除每个商品的第一张主图\n2. 如果商品只有一张主图，将自动跳过该商品\n\n此操作将删除所有选中商品的第一张主图，请再次确认是否继续？',
    async () => {
      try {
        await showProgressAndStartTask(
          deleteFirstFoodImage,
          {
            TaskId: taskId.value,
            ShopId: shopId.value,
            SyncSite: syncSite.value,
            GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
            FoodIds: selectedFoodIds.value
          },
          '删除商品主图',
          'deleteImage'
        )
      } catch (error) {
        ElMessage.error('删除失败')
      }
    }
  )
}

// 恢复商品
const handleRecover = () => {
  if (selectedFoodIds.value.length === 0 && selectedGroups.value.length === 0) {
    ElMessage.warning('请选择商品或分组')
    return
  }

  dialogs.confirm.visible = true
  dialogs.confirm.title = '恢复商品'

  // 构建提示内容
  let content = '确定要恢复商品吗？\n注意：\n1. 将从上次从平台拉取的商品中恢复\n2. 恢复商品不涉及折扣操作，需根据平台规则重新设置折扣等'

  // 如果选择了分组，添加分组信息
  if (selectedGroups.value.length > 0 && selectedFoodIds.value.length === 0) {
    const groupNames = selectedGroups.value.map(groupId => {
      const group = groups.value.find(g => g.office_id === groupId || g.id === groupId)
      return group?.name || groupId
    })
    content += `\n\n将恢复以下分组下的所有商品：\n${groupNames.map(name => `• ${name}`).join('\n')}`
  }

  dialogs.confirm.content = content
  dialogs.confirm.onConfirm = async () => {
    try {
      await showProgressAndStartTask(
        recoverFoods,
        {
          TaskId: taskId.value,
          ShopId: shopId.value,
          SyncSite: syncSite.value,
          GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
          FoodIds: selectedFoodIds.value
        },
        '恢复商品',
        'recover'
      )
    } catch (error) {
      ElMessage.error('恢复失败')
    }
  }
}

// 处理单个商品恢复
const handleSingleRecover = (row: FoodManageApi.FoodItemVo) => {
  // 将选中的商品ID设置为当前行
  selectedFoods.value = [row.SpuId]
  selectedFoodIds.value = [row.id]

  dialogs.confirm.visible = true
  dialogs.confirm.title = '恢复商品'
  dialogs.confirm.content = '确定要恢复该商品吗？\n注意：\n1. 将从上次从平台拉取的商品中恢复\n2. 恢复商品不涉及折扣操作，需根据平台规则重新设置折扣等'
  dialogs.confirm.onConfirm = async () => {
    try {
      await showProgressAndStartTask(
        recoverFoods,
        {
          TaskId: taskId.value,
          ShopId: shopId.value,
          SyncSite: syncSite.value,
          GroupOffids: null,
          FoodIds: [row.id]
        },
        '恢复商品',
        'recover'
      )
    } catch (error) {
      ElMessage.error('恢复失败')
    }
  }
}

// 处理任务完成
const handleProgressComplete = async () => {
  showProgress.value = false
  // 如果是 pullShopFoods、pullShopFoodsV2 或 pullShopAct 任务，重新加载分组和商品
  if (["pullShopFoods", "pullShopFoodsV2", "pullShopAct"].includes(progressInfo.value.taskType)) {
    try {
      await loadFoodGroups()
      ElMessage.success('商品分组已更新')
    } catch (error) {
      console.error('重新加载分组失败:', error)
      ElMessage.error('重新加载分组失败')
    }
  }
  // 如果是批量修改价格任务，刷新商品列表以显示最新价格
  if (progressInfo.value.taskType === 'updatePrice') {
    try {
      // 先刷新商品列表
      await loadFoods()
      // 等待一小段时间，确保数据已更新
      await new Promise(resolve => setTimeout(resolve, 300))
      // 然后显示完成提示
      ElMessage.success({
        message: '价格修改完成！所有商品价格已更新到数据库，商品列表已刷新，现在可以开始批量复制了',
        duration: 5000,
        showClose: true
      })
    } catch (error) {
      console.error('刷新商品列表失败:', error)
      ElMessage.warning('价格修改完成，但刷新商品列表失败，请手动刷新')
    }
  } else {
    // 无论什么任务都刷新商品列表
    await loadFoods()
  }
  if (progressInfo.value.taskType === 'pullShopAct') {
    ElMessage.success('活动拉取完成，商品已刷新')
  }
}

// 处理任务错误
const handleProgressError = (errors: string[]) => {
  ElMessage.error(errors.join('\n'))
}

// 处理任务停止
const handleProgressStop = () => {
  showProgress.value = false
  ElMessage.warning('任务已停止')
}

const onlyMainImage = ref(true)
const firstProductImage = computed(() => {
  if (foods.value.length > 0) {
    const food = foods.value[0]
    if (food.ImageUrls && food.ImageUrls.length > 0) {
      return food.ImageUrls[0].Img
    }
    // 兜底：尝试 food.Img 或空字符串
    // @ts-ignore
    return food.Img || ''
  }
  return ''
})
const baseParams = computed(() => ({
  SyncSite: syncSite.value,
  GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
  TaskId: taskId.value,
  ShopId: shopId.value
}))

// 添加计算属性：获取选中的分组名称
const selectedGroupNames = computed(() => {
  return selectedGroups.value.map(groupId => {
    // 递归查找分组
    const findGroup = (groups: FoodManageApi.FoodGroupVoItem[]): string | undefined => {
      for (const group of groups) {
        if (group.office_id === groupId) {
          return group.Group?.Name || group.name
        }
        if (group.Children) {
          const found = findGroup(group.Children)
          if (found) return found
        }
      }
      return undefined
    }
    return findGroup(groups.value) || groupId
  })
})

// 添加通用提示函数
const showGroupOperationConfirm = (title: string, content: string, onConfirm: () => Promise<void>) => {
  if (selectedFoodIds.value.length === 0 && selectedGroups.value.length > 0) {
    dialogs.confirm.visible = true
    dialogs.confirm.title = title
    dialogs.confirm.content = `${content}\n\n将操作以下分组下的所有商品：\n${selectedGroupNames.value.map(name => `• ${name}`).join('\n')}`
    dialogs.confirm.onConfirm = onConfirm
  } else if (selectedFoodIds.value.length === 0) {
    ElMessage.warning('请选择商品或分组')
  } else if (title.includes("删除")) {
    dialogs.confirm.visible = true
    dialogs.confirm.title = title
    dialogs.confirm.content = content
    dialogs.confirm.onConfirm = onConfirm
  } else {
    onConfirm()
  }
}

const handlePullShopFoodsV2 = () => {
  dialogs.confirm.visible = true
  dialogs.confirm.title = '警告'
  dialogs.confirm.content = '重新拉取店铺商品后,下次恢复商品时将以此次拉取的商品为准'
  dialogs.confirm.onConfirm = async () => {
    try {
      await showProgressAndStartTask(
        pullShopFoodsV2,
        {
          TaskId: taskId.value,
          IsDeleteAllFoods: true
        },
        '重新拉取店铺商品',
        'pullShopFoodsV2'
      )
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }
}

/**
 * 重新拉取活动并显示进度，完成后刷新商品列表
 */
const handlePullShopAct = () => {
  dialogs.confirm.visible = true
  dialogs.confirm.title = '提示'
  dialogs.confirm.content = '该操作将重新获取店铺最新商品活动，过程可能较长，是否继续。？'
  dialogs.confirm.onConfirm = async () => {
    try {
      await showProgressAndStartTask(
        pullShopAct,
        {
          SyncSite: syncSite.value,
          GroupOffids: selectedGroups.value.length > 0 ? selectedGroups.value : null,
          TaskId: taskId.value
        },
        '重新拉取活动',
        'pullShopAct'
      )
      // 此处不再直接刷新商品列表或弹出成功提示，由 handleProgressComplete 统一处理
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }
}


</script>

<style lang="scss">
.food-manage {
  display: flex;
  max-height: calc(100vh - 200px); // 设置最大高度，避免溢出视口
  background-color: var(--el-bg-color);
  overflow: hidden;
  position: relative; // 让遮罩绝对定位于food-manage内部

  &__left {
    // width: 300px;
    // min-width: 300px;
    border-right: 1px solid var(--el-border-color-light);
    padding: 12px 16px; // 减小内边距
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .button-actions {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
      margin-bottom: 12px; // 减小底部间距
    }

    .tree-wrapper {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }
  }

  &__right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 16px; // 减小内边距
    overflow: hidden;
  }

  &__header {
    margin-bottom: 12px; // 减小底部间距
    flex-shrink: 0;

    :deep(.el-tabs) {
      margin-bottom: 8px; // 减小 tabs 底部间距
    }

    :deep(.el-tabs__header) {
      margin-bottom: 8px; // 减小 tabs header 底部间距
    }

    .search-form {
      margin-top: 8px; // 减小顶部间距

      :deep(.el-form) {
        margin-bottom: 0; // 移除表单底部间距
      }

      :deep(.el-form-item) {
        margin-bottom: 8px; // 减小表单项底部间距
      }
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0; // 确保 flex 子元素能够正确计算高度

    .operation-buttons {
      margin-bottom: 12px; // 减小底部间距
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      flex-shrink: 0;

      .batch-operation-title {
        font-size: 16px;
        font-weight: bold;
        color: var(--el-text-color-primary);
        padding: 4px 8px;
        border-left: 4px solid var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .button-group-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
    }

    .table-wrapper {
      flex: 1;
      overflow-y: auto; // 只在垂直方向滚动
      overflow-x: hidden;
      min-height: 0; // 确保能够正确收缩
      max-height: calc(100vh - 400px); // 设置最大高度
    }

    .pagination-wrapper {
      flex-shrink: 0;
      padding-top: 12px; // 减小顶部间距
      padding-bottom: 8px; // 减小底部间距
      display: flex;
      justify-content: center;
    }
  }
}

.food-manage-overlay {
  position: absolute;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7); // 半透明白色遮罩
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-dialog {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  padding: 32px 24px;
  min-width: 400px;
  max-width: 90vw;
}

.no-header-dialog .el-dialog__header {
  display: none;
}

.no-header-dialog .el-dialog__body {
  padding: 0 !important;
}

.food-table-loading {
  .el-loading-spinner {
    .circular {
      width: 42px;
      height: 42px;
    }

    .el-loading-text {
      font-size: 14px;
      margin-top: 8px;
      color: var(--el-color-primary);
    }
  }
}
</style>