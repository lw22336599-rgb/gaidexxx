<template>
  <div>
    <div style="display: flex;align-items: center;margin-bottom: 30px;">
      <div style="margin-right: 20px;">门店类型</div>
      <el-radio-group v-model="queryParams.filter.func_state" @change="getShopListPage">
        <el-radio :value="1">已激活</el-radio>
        <el-radio :value="5">未激活</el-radio>
        <el-radio :value="3">托管任务列表</el-radio>
      </el-radio-group>

    </div>
    <!-- 托管任务列表 -->
    <template v-if="queryParams.filter.func_state === 3">
      <keep-alive>
        <task-job-list :task-type="defaultTaskType" :new-shop-type="defaultNewShopType"
          @move-shop="handleTaskMoveShop" />
      </keep-alive>
    </template>
    <!-- 店铺列表 -->
    <template v-else>
      <div class="search-top">
        <div class="search-left">
          <el-input v-model="queryParams.filter.word" class="filter-input" clearable placeholder="请输入门店id或门店名称进行搜索"
            @change="getShopListNonePage" @clear="getShopListNonePage" />
          <el-button type="primary" @click="getShopListNonePage">搜索</el-button>
          <div class="state-text">授权状态:</div>
          <div class="tips-list">
            <div :class="{ 'success': isActive === 1 }" @click="selectState(1)">授权正常</div>
            <div :class="{ 'error': isActive === 2 }" @click="selectState(2)">授权异常</div>
          </div>
          <div class="state-text">（授权异常会导致功能无法正常使用，请及时修复授权异常店铺）</div>
        </div>
        <div class="search-right">
          <el-button type="primary" @click="openApp('')">添加店铺</el-button>
        </div>
      </div>
      <div class="table-main">
        <el-table v-loading="tableLoading" :data="tableData" height="calc(100vh - 400px)" style="width: 100%">
          <el-table-column label="门店信息" prop="name" width="200">
            <template #default="{ row }">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="cursor: pointer;color: var(--el-color-primary);" :class="{ 'blur-text': demoMode }"
                  @click="openWindow(row)">{{ row.name
                  }}</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 12px; color: #909399;">门店ID：<span :class="{ 'blur-text': demoMode }">{{
                    row.office_id }}</span></span>
                  <el-icon style="cursor: pointer; color: #909399; font-size: 14px;"
                    @click.stop="copyOfficeId(row.office_id)" title="复制门店ID">
                    <DocumentCopy />
                  </el-icon>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="门店LOGO" width="120">
            <template #default="{ row }">
              <div style="width: 80px;height: 80px;border-radius: 6px;overflow: hidden;">
                <img alt="" :src="row.img" style="width: 80px;height: 80px;">
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="授权状态" width="240">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;flex-wrap: wrap;justify-content: center;">
                <div :class="row.state == 3 ? 'redcityname' : 'greencityname'">
                  <div class="citytip"></div>
                  <div class="citytext">{{ row.state == 3 ? '授权异常' : '授权正常' }}</div>
                </div>
                <el-button v-if="row.state == 3" style="margin-left:10px" type="warning"
                  @click="openApp(row.name)">修复</el-button>
                <div style="width: 100%;">{{ row.ck_uptime || '' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" prop="date" align="center" width="240">
            <template #default="{ row }">
              <div
                style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100%;">
                <div style="text-align: center;">{{ getEndTime(row) }}</div>
                <div style="display: flex; justify-content: center; width: 100%;">
                  <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'FOODMOVE'" type="text"
                    @click="payFunShow(row, '菜品搬家')">追加续费</el-button>
                  <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'FDMVCONTEND'" type="text"
                    @click="payFunShow(row, '竞对复制')">追加续费</el-button>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="address">
            <template #default="{ row }">
              <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'FOODMOVE'" type="text"
                @click="goMoveShop(row)">进店搬菜</el-button>
              <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'FDMVCONTEND'" type="text"
                @click="goMoveShop(row)">进店搬菜</el-button>
              <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'FOODMANAGE'" type="text"
                @click="goMoveShop(row)">批量改价</el-button>
              <el-button v-if="queryParams.filter.func_state === 1 && func_code === 'UPDATEFOODIMAGE'" type="text"
                @click="goMoveShop(row)">进店改边框</el-button>
              <!-- 续费 -->
              <el-button v-if="queryParams.filter.func_state === 5 && func_code === 'FOODMOVE'" type="text"
                @click="payFunShow(row, '菜品搬家')"> 激活</el-button>
              <el-button v-if="queryParams.filter.func_state === 5 && func_code === 'FDMVCONTEND'" type="text"
                @click="payFunShow(row, '竞对复制')">激活</el-button>
              <el-button v-if="queryParams.filter.func_state === 5 && func_code === 'FOODMANAGE'" type="text"
                @click="payFunShow(row, '批量改价')"> 激活</el-button>
              <el-button v-if="queryParams.filter.func_state === 5 && func_code === 'UPDATEFOODIMAGE'" type="text"
                @click="payFunShow(row, '批量加边框')">激活</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="display: flex;justify-content: center;margin-top: 20px;">
          <vab-pagination :current-page="queryParams.page" :page-size="queryParams.pageSize" :total="total"
            @current-change="handleCurrentChange" @size-change="handleSizeChange" />
        </div>
      </div>
    </template>
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
  </div>
</template>
<script setup lang="ts">
import { addShop, getShop, getShopFdmv } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import PayDialog from '/@/views/shop/componentsV2/PayDialog.vue'
import { openShopWindow } from '~/src/utils/openShopWin'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import TaskJobList from './TaskJobList.vue'
import { CreateTaskTypeEnum } from '/@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum'
import { DocumentCopy } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

const func_code = ref('')
const props = defineProps({
  type: String
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
if (props.type === 'copy-old-shop') {
  func_code.value = 'FOODMOVE'
} else if (props.type === 'compare-copy-shop') {
  func_code.value = 'FDMVCONTEND'
} else if (props.type === 'batch-price') {
  func_code.value = 'FOODMANAGE'
} else if (props.type === 'updat-foodimg') {
  func_code.value = 'UPDATEFOODIMAGE'
}
const emit = defineEmits(['moveShop'])
const isActive = ref(1)
const route = useRoute()
const showShopMsgState = ref(false)
const showShopMsg = ref({})
const isBind = ref(false)
const tableData = ref([])
const total = ref(0)
const tableLoading = ref(false)
const queryParams = reactive({
  filter: {
    func_state: 1,
    func_code: func_code.value,
    ck_online: true,
    shopType: route.meta.type as number,
    word: '',
    state: undefined as number | undefined
  },
  page: 1,
  pageSize: 20,
})
const getShopList = () => {
  tableLoading.value = true
  getShopFdmv(queryParams).then((res: any) => {
    if (res.code === 200) {
      tableData.value = res.data.rows
      total.value = res.data.total
    }
  }).finally(() => {
    tableLoading.value = false
  })
}
getShopList()
const getShopListPage = (val: any) => {
  queryParams.filter.func_state = val
  queryParams.page = 1
  getShopList()
}
const getShopListNonePage = () => {
  console.log(queryParams.filter.func_state)
  queryParams.page = 1
  getShopList()
}
const handleSizeChange = (value: number) => {
  queryParams.page = 1
  queryParams.pageSize = value
  getShopList()
}

const handleCurrentChange = (value: number) => {
  queryParams.page = value
  getShopList()
}
const selectState = (index: number) => {
  isActive.value = index
  if (index === 1) {
    queryParams.filter.ck_online = true
    queryParams.filter.state = undefined
  } else if (index === 2) {
    queryParams.filter.ck_online = undefined as any
    queryParams.filter.state = 3
  }
  getShopListNonePage()
}
const openApp = async (name: any) => {
  if (queryParams.filter.shopType === 8) {
    const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方);
    window.open(authResult.Url, '_blank')
    return
  }
  if (!globalThis.electron) {
    gp.$baseMessage('当前环境不支持浏览操作', 'error', 'hey')
    return
  }
  const invokeMap: Record<number, string> = {
    1: 'open-mt-wm',
    2: 'open-elm-wm',
    3: 'open-mt-wm',
    4: 'open-mt-wm',
    5: 'open-elm-retail',
    6: 'open-jd-home',
    7: 'open-dy-retail',
    8: 'open-elm-wm',
    1000: 'open-mt-groupbuy',
    1001: 'open-jd-home',
    1002: 'open-dy-tuangou-capture',
  };
  const params = {
    name: name || '',
    shop_type: queryParams.filter.shopType,
  }
  globalThis.electron.openBrowser(invokeMap[queryParams.filter.shopType as number], params, async (res: any) => {
    let data = {
      shop_type: params.shop_type,
      // shop_user: res?.info?.u,
      // shop_pwd: res?.info?.p,
      shop_user: '',
      shop_pwd: '',
      cookies: res.cookies
    }
    addShop(data).then((res1: any) => {
      if (res1.code === 200) {
        if (params.name) {
          gp.$baseMessage('店铺修复成功!', 'success', 'hey')
        } else {
          gp.$baseMessage('店铺添加成功!', 'success', 'hey')
          showShopMsg.value = {
            name: res1.data.name,
            office_id: res1.data.office_id,
            shop_type: params.shop_type,
            // shop_user: res?.info?.u,
            // shop_pwd: res?.info?.p,
            shop_user: '',
            shop_pwd: '',
            cookies: res.cookies,
            reset_power: false
          }
          showShopMsgState.value = true
          isBind.value = false
        }
        getShopList()
      }
    })
  });
}
const closeShopAfter = () => {
  showShopMsgState.value = false
}
/**
 * 老店列表中点击“门店名称”打开店铺
 * 统一走公共的 openShopWindow 方法，内部会通过 ShopMgApi.GetShopCk 获取最新 cookies
 */
const openWindow = (row: any) => {
  openShopWindow(row)
}
// 复制门店ID到剪贴板
const copyOfficeId = async (officeId: string) => {
  try {
    await navigator.clipboard.writeText(officeId)
    gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
  } catch (error) {
    // 如果 clipboard API 不可用，使用备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = officeId
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
    } catch (fallbackError) {
      gp.$baseMessage('复制失败，请手动复制', 'error', 'hey')
    }
  }
}
const getEndTime = (row: any) => {
  let selectData = row.func_info ? row.func_info.filter((item: any) => item.code === func_code.value) : []
  if (selectData && selectData.length > 0) {
    const endTime = new Date(selectData[0].end_time.replace(' ', 'T'))
    const now = new Date()

    if (endTime < now) {
      return '已到期'
    } else {
      // 计算剩余时间（毫秒）
      const diffTime = endTime.getTime() - now.getTime()

      if (diffTime <= 0) {
        return '已到期'
      }

      // 计算剩余天数和小时数
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (diffDays === 0) {
        // 如果不足1天，只显示小时
        if (diffHours === 0) {
          return '已到期'
        } else if (diffHours === 1) {
          return '剩余1小时'
        } else {
          return `剩余${diffHours}小时`
        }
      } else if (diffDays === 1) {
        // 1天的情况
        if (diffHours === 0) {
          return '剩余1天'
        } else if (diffHours === 1) {
          return '剩余1天1小时'
        } else {
          return `剩余1天${diffHours}小时`
        }
      } else {
        // 多天的情况
        if (diffHours === 0) {
          return `剩余${diffDays}天`
        } else if (diffHours === 1) {
          return `剩余${diffDays}天1小时`
        } else {
          return `剩余${diffDays}天${diffHours}小时`
        }
      }
    }
  } else {
    return '已到期'
  }
}
const goMoveShop = (row: any) => {
  if (row.state === 3) {
    return gp.$baseMessage('店铺授权状态异常，请先修复店铺，再进行此操作!!', 'error', 'hey')
  }
  console.log(props, 'goMoveShop from shopmovelist.vue')
  console.log(props.type)
  if (props.type === 'copy-old-shop') {
    emit('moveShop', Object.assign(row, { type: 'move-shop' }))
  } else if (props.type === 'compare-copy-shop') {
    emit('moveShop', Object.assign(row, { type: 'compare-shop' }))
  }
  else if (props.type === 'batch-price') {
    emit('moveShop', Object.assign(row, { type: 'batch-price' }))
  } else if (props.type === 'updat-foodimg') {
    emit('moveShop', Object.assign(row, { type: 'updat-foodimg' }))
  } else {
    //报错
    console.log('报错')
  }
}

const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)
// 记录是否需要支付成功后自动跳转（激活或追加续费都需要跳转）
const shouldAutoJumpAfterPay = ref(false)
const payFunShow = (row: any, typeText: string) => {
  shopData.value = row
  payTypeText.value = typeText
  // 判断是否需要自动跳转：激活（未激活状态）或追加续费（已激活状态）都需要跳转
  // 但只针对支持跳转的功能：FOODMOVE（菜品搬家）和 FDMVCONTEND（竞对复制）
  const isActivating = queryParams.filter.func_state === 5
  const isRenewing = queryParams.filter.func_state === 1
  const canJump = func_code.value === 'FOODMOVE' || func_code.value === 'FDMVCONTEND'
  shouldAutoJumpAfterPay.value = (isActivating || isRenewing) && canJump
  payDialogState.value = true
}
const closePayDialog = () => {
  payDialogState.value = false
  shouldAutoJumpAfterPay.value = false
}
const paySuccess = () => {
  payDialogState.value = false

  // 如果需要自动跳转（激活或追加续费），支付成功后自动跳转到搬菜页面
  if (shouldAutoJumpAfterPay.value && shopData.value) {
    // 刷新列表后自动跳转
    getShopList()
    // 等待列表刷新完成后再跳转（确保店铺状态已更新）
    setTimeout(() => {
      // 检查店铺授权状态，如果异常则不跳转
      if (shopData.value.state === 3) {
        gp.$baseMessage('店铺授权状态异常，请先修复店铺授权', 'warning', 'hey')
        shouldAutoJumpAfterPay.value = false
        return
      }
      // 自动跳转到搬菜页面
      goMoveShop(shopData.value)
      shouldAutoJumpAfterPay.value = false
    }, 500)
  } else {
    // 如果不需要跳转，只刷新列表
    getShopList()
    shouldAutoJumpAfterPay.value = false
  }
}

// 计算默认的 TaskType
const defaultTaskType = computed(() => {
  if (props.type === 'copy-old-shop') {
    return CreateTaskTypeEnum.老到新复制
  } else if (props.type === 'compare-copy-shop') {
    return CreateTaskTypeEnum.竞对复制
  }
  return CreateTaskTypeEnum.None
})

// 计算默认的 NewShopType
const defaultNewShopType = computed(() => {
  return (route.meta.type as number) || ShopType.None
})

// 处理从任务列表进入的跳转
const handleTaskMoveShop = (data: {
  taskId: string
  taskType: CreateTaskTypeEnum
  oldShop?: any
  newShop?: any
  oldShopReady?: boolean
}) => {
  // 验证 newShop 是否存在且有必要的属性
  if (!data.newShop || !data.newShop.name || !data.newShop.office_id) {
    gp.$baseMessage('新店数据不完整，无法进入搬菜页面', 'error', 'hey')
    return
  }

  if (data.taskType === CreateTaskTypeEnum.老到新复制) {
    // 跳转到老到新复制界面
    emit('moveShop', Object.assign({}, data.newShop, { type: 'move-shop', taskId: data.taskId, oldShop: data.oldShop }))
  } else if (data.taskType === CreateTaskTypeEnum.竞对复制) {
    // 跳转到竞对复制界面
    emit('moveShop', Object.assign({}, data.newShop, { type: 'compare-shop', taskId: data.taskId, oldShop: data.oldShop }))
  }
}
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

    .filter-input {
      width: 240px;
      margin-right: 10px;
    }

    .state-text {
      margin: 0 10px 0 20px;
      font-size: 12px;
    }

    .tips-list {
      display: flex;
      background: #cccccc;
      overflow: hidden;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      border-radius: 16px;

      >div {
        padding: 0 10px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        cursor: pointer;
        border-radius: 16px;
        color: #ffffff;
      }

      .success {
        background: #409EFF;
      }

      .error {
        background: #F56C6C;
      }
    }
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