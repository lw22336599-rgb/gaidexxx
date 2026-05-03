<template>
  <div class="page-container">
    <div class="screen-container">
      <!-- 店铺类型导航栏 -->
      <div class="shop-type-nav">
        <div class="shop-type-list">
          <el-dropdown v-for="option in shopTypeOptions" :key="option.value" trigger="hover" placement="bottom-start"
            @command="handleDropdownCommand">
            <div class="shop-type-item" :class="{ active: queryForm.shopType === option.value }"
              @click.stop="handleShopTypeChange(option.value)">
              <PlatformIcon :shop-type="option.value" :size="20" />
              <span class="shop-type-label">{{ option.label }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="shop-type-dropdown-menu">
                <el-dropdown-item v-if="isElectron" :command="{ action: 'auth', shopType: option.value }"
                  class="dropdown-item-auth">
                  <el-button type="success" plain size="small" class="dropdown-button">
                    <el-icon style="margin-right: 6px">
                      <Key />
                    </el-icon>
                    <span>授权店铺</span>
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'bind', shopType: option.value }" class="dropdown-item-bind">
                  <el-button type="primary" plain size="small" class="dropdown-button">
                    <vab-icon icon="attachment-line" style="margin-right: 6px" />
                    <span>绑定店铺</span>
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 搜索框移动到京东到家后面，并与店铺类型选择器同一行 -->
        <div class="shop-type-search">
          <el-input v-model="queryForm.searchText" clearable placeholder="搜索门店名称或ID或备注" style="width: 220px"
            @change="handleSearch" />
        </div>
      </div>
    </div>
    <el-divider style="margin: 6px 0" />
    <div class="shop-table">
      <el-table v-loading="listLoading" :data="shopList" :height="tableHeight" stripe>
        <el-table-column align="left" fixed="left" label="门店名称" min-width="300">
          <template #default="{ row }">
            <div class="item-shop">
              <div class="item-right">
                <div class="item-name" @click="openWindow(row)">
                  <PlatformIcon class="logo" :shop-type="row.shop_type" :size="20" />
                  <span class="name-text" :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
                </div>
                <div class="item-office-id">
                  <span :class="{ 'blur-text': demoMode }">门店ID：{{ row.office_id }}</span>
                </div>
                <div class="item-remark">门店备注：{{ row.notes || '暂无' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="门店头像" min-width="120">
          <template #default="{ row }">
            <el-popover placement="top-start">
              <el-image :src="row.img" :class="{ 'blur-image': demoMode }" />
              <template #reference>
                <div style="position: relative">
                  <el-image :src="row.img" style="width: 70px; height: 70px" :class="{ 'blur-image': demoMode }" />
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column align="center" label="门店城市" min-width="100">
          <template #default="{ row }">
            <div v-if="row.city" class="item-office-id">
              <vab-icon icon="map-pin-fill" /><span class="city-name">{{ row.city }}</span>
            </div>
            <div class="item-remark">门店分组：{{ row.group_name || '暂无' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" min-width="200">
          <template #header>
            <div class="shop-status-header">
              <span class="header-label">店铺状态</span>
              <el-dropdown trigger="hover" placement="bottom" class="header-filter-dropdown"
                @command="handleChangeOnline">
                <el-button type="primary" size="small" text class="filter-button">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getOnlineFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="online-filter-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': queryForm.online === '全部' }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="'授权正常'" :class="{ 'is-selected': queryForm.online === '授权正常' }">
                      授权正常
                    </el-dropdown-item>
                    <el-dropdown-item :command="'授权异常'" :class="{ 'is-selected': queryForm.online === '授权异常' }">
                      授权异常
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="{ row }">
            <div v-if="row.state !== 3">
              <vab-icon icon="award-fill" :style="`color: ${row.state === 4 ? 'rgb(238, 145, 63)' : '#909399'}`" />
              <span v-if="row.state === 4" class="shop-state">营业中</span>
              <span v-if="row.state === 5" class="shop-state">暂停营业</span>
              <span v-if="row.state === 6" class="shop-state">店铺上线中</span>
              <span v-if="row.state === 7" class="shop-state">店铺已下线</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; margin: 6px 0">
              <div class="state-text">
                <span class="suc-dot" :class="{ 'err-dot': row.state == 3 }"></span>
                {{ row.state == 3 ? '授权异常' : '授权正常' }}
              </div>
            </div>
            <div style="margin-top: 6px">
              <el-button type="primary" size="small" plain @click="handleShowBindList(row)">
                {{ (Array.isArray(row.MgAgencys) ? row.MgAgencys.length : 0) }}人绑定
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="总开关" min-width="100">
          <template #default="{ row }">
            <el-button v-if="getKefuFunc(row) && row.KEFU" type="danger" size="small" @click="handleCloseAll(row)">
              关闭全部
            </el-button>
            <div v-if="getKefuFunc(row) && row.KEFU" style="font-size: 12px; color: #909399; margin-top: 6px">
              关闭IM客服和IM自动回复
            </div>
            <span v-else style="color: #999; font-size: 14px">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" min-width="230">
          <template #header>
            <div class="shop-status-header">
              <span class="header-label">IM客服</span>
              <el-dropdown trigger="hover" placement="bottom" class="header-filter-dropdown"
                @command="handleChangeKefuStatus">
                <el-button type="primary" size="small" text class="filter-button">
                  <el-icon style="margin-right: 4px">
                    <Filter />
                  </el-icon>
                  {{ getKefuFilterText() }}
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="online-filter-menu">
                    <el-dropdown-item :command="'全部'" :class="{ 'is-selected': !queryForm.kefuStatus }">
                      全部
                    </el-dropdown-item>
                    <el-dropdown-item :command="Filter_FuncState.未到期"
                      :class="{ 'is-selected': queryForm.kefuStatus === Filter_FuncState.未到期 }">
                      未到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="Filter_FuncState.即将到期"
                      :class="{ 'is-selected': queryForm.kefuStatus === Filter_FuncState.即将到期 }">
                      即将到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="Filter_FuncState.已经到期"
                      :class="{ 'is-selected': queryForm.kefuStatus === Filter_FuncState.已经到期 }">
                      已到期
                    </el-dropdown-item>
                    <el-dropdown-item :command="Filter_FuncState.功能已开启"
                      :class="{ 'is-selected': queryForm.kefuStatus === Filter_FuncState.功能已开启 }">
                      已开启
                    </el-dropdown-item>
                    <el-dropdown-item :command="Filter_FuncState.功能已关闭"
                      :class="{ 'is-selected': queryForm.kefuStatus === Filter_FuncState.功能已关闭 }">
                      已关闭
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="{ row }">
            <template v-if="getKefuFunc(row)">
              <el-switch v-model="row.KEFU" active-color="var(--el-color-primary)" inactive-color="#D8D8D8"
                @change="handleKefuSwitchChange(row)" />
              <div style="font-size: 12px; margin-top: 6px">功能剩余：{{ getExpireTime(row) }}</div>
              <span class="pointer" style="font-size: 14px; color: var(--el-color-primary); margin-top: 6px"
                @click="handleRenew(row)">续费</span>
            </template>
            <template v-else>
              <div style="color: #999; font-size: 14px; margin-bottom: 6px">未购买</div>
              <span class="pointer" style="font-size: 14px; color: var(--el-color-primary)"
                @click="handleRenew(row)">续费</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column align="center" label="IM自动回复" min-width="140">
          <template #default="{ row }">
            <template v-if="getImzdHfFunc(row)">
              <el-switch v-model="row.IMZDHF" active-color="var(--el-color-primary)" inactive-color="#D8D8D8"
                @change="handleImzdhfSwitchChange(row)" />
              <div style="font-size: 12px; margin-top: 6px">功能剩余：{{ getImzdhfExpireTime(row) }}</div>
              <div class="pointer" style="font-size: 12px; margin-top: 4px; color: var(--el-color-primary)"
                @click="openImAutoReplySetting(row)">
                回复设置
              </div>
            </template>
            <template v-else>
              <div style="color: #999; font-size: 14px">未购买</div>
            </template>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty class="vab-data-empty" description="暂无店铺数据" />
        </template>
      </el-table>
      <vab-pagination :current-page="queryForm.page" :page-size="queryForm.pageSize" :total="total"
        @current-change="handleCurrentChange" @size-change="handleSizeChange" :class="{ 'demo-mode': demoMode }" />
    </div>
    <!-- 支付对话框 -->
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
    <!-- 功能设置抽屉（IM 自动回复设置等） -->
    <all-func-setting v-if="drawerState" :current-row="currentRow" :drawer-fun="drawerFun" :drawer-state="drawerState"
      :icon="icon" @close-drawer="closeDrawer" />
    <!-- 绑定店铺成功对话框 -->
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <!-- 绑定用户列表对话框 -->
    <el-dialog v-model="bindListDialogVisible" title="绑定用户列表" width="800px" :close-on-click-modal="false">
      <el-table v-loading="bindListLoading" :data="bindListData" stripe max-height="500px">
        <el-table-column label="用户名" prop="user_name" min-width="120" />
        <el-table-column label="用户代码" prop="user_code" min-width="100" />
        <el-table-column label="绑定时间" min-width="160">
          <template #default="{ row }">
            {{ row.bind_time ? new Date(row.bind_time).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="notes" min-width="120" show-overflow-tooltip />
        <el-table-column label="是否为客服" align="center" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row.Roles && row.Roles.includes('KEFU')" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="100" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canRemoveBind(row)" type="danger" size="small" text @click="handleRemoveBind(row)">
              移除绑定
            </el-button>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无绑定用户" />
        </template>
      </el-table>
      <template #footer>
        <el-button @click="bindListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Key, Filter, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type { ShopList_ResulItem } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem'
import type { ShopUserBindVo } from '/@/TsModel/Alien/Controllers/Shop/ShopUserBindVo'
import type { ShopUserBindItem } from '/@/TsModel/Alien/Controllers/Shop/ShopUserBindItem'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { Filter_FuncState } from '/@/TsModel/Alien/Controllers/Shop/Filter_FuncState'
import { gp } from '/@vab/plugins/vab'
import PayDialog from '/@/views/shop/componentsV2/PayDialog.vue'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import AllFuncSetting from '/@/views/shop/componentsV2/AllFuncSetting.vue'
import { bindShop } from '/@/api/shop.ts'
import { openShopWindow } from '/@/utils/openShopWin'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { useSettingsStore } from '/@/store/modules/settings'

// 检查是否在Electron环境中
const isElectron = !!((globalThis as any).electron)

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 获取当前登录用户ID
const getCurrentUserId = (): string | null => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo?.admin?.id || null
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
  return null
}

// 监听 demoMode 变化，强制更新表格以应用模糊效果
watch(demoMode, () => {
  nextTick(() => {
    if (shopList.value && shopList.value.length > 0) {
      const temp = [...shopList.value]
      shopList.value = []
      nextTick(() => {
        shopList.value = temp
      })
    }
  })
})

// 扩展店铺数据类型，添加功能开关状态
interface ShopItemWithSwitch extends ShopList_ResulItem {
  KEFU: boolean
  IMZDHF: boolean
}

// 授权状态选项
const onlineOptions = ['全部', '授权正常', '授权异常']

// 店铺类型选项（排除抖店即时零售和饿了么官方）
const shopTypeOptions = [
  { label: '美团', value: ShopType.美团 },
  { label: '饿了么', value: ShopType.饿了么 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 },
]

// 查询表单
const queryForm = reactive({
  online: '全部',
  searchText: '',
  shopType: ShopType.美团,
  kefuStatus: undefined as Filter_FuncState | undefined,
  ckOnline: undefined as boolean | undefined,
  state: undefined as number | undefined,
  page: 1,
  pageSize: 20,
})

// 列表数据
const listLoading = ref(false)
const shopList = ref<ShopItemWithSwitch[]>([])
const total = ref(0)

// 支付对话框
const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)

// 功能设置抽屉（IM 自动回复等）
const drawerState = ref(false)
const drawerFun = ref<string>('IMZDHF')
const currentRow = ref<Record<string, any>>({})
const icon = ref<string>('im-autoreply')

// 绑定店铺成功对话框
const showShopMsg = ref({})
const showShopMsgState = ref(false)
const isBind = ref(false)

// 绑定用户列表对话框
const bindListDialogVisible = ref(false)
const bindListLoading = ref(false)
const bindListData = ref<ShopUserBindItem[]>([])
const currentShopBindInfo = ref<ShopUserBindVo | null>(null)
const currentShopRow = ref<ShopItemWithSwitch | null>(null)

// 表格高度计算
const tableHeight = computed(() => {
  // 顶部导航约60px + 筛选区域约140px + 分页约50px + padding约30px = 280px
  return window.innerHeight - 280
})

/**
 * 获取店铺的 IMZDHF 功能信息（用于开关控制）
 */
const getImzdHfFunc = (row: ShopList_ResulItem) => {
  if (!Array.isArray(row.func_info)) return null
  return row.func_info.find(func => func.code === 'IMZDHF')
}

/**
 * 获取店铺的 KEFU 功能信息（用于续费和到期时间）
 */
const getKefuFunc = (row: ShopList_ResulItem) => {
  if (!Array.isArray(row.func_info)) return null
  return row.func_info.find(func => func.code === 'KEFU')
}

/**
 * 计算剩余天数显示文案
 */
const getRemainDaysText = (endTime?: string | number | Date) => {
  if (!endTime) return '未购买'

  const end = new Date(endTime).getTime()
  if (Number.isNaN(end)) return '未购买'

  const now = Date.now()
  const diffMs = end - now

  if (diffMs <= 0) {
    return '已到期'
  }

  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.ceil(diffMs / dayMs)
  return `${days}天`
}

/**
 * 获取到期时间显示（IM 客服）
 * 显示为“剩余 X 天”
 */
const getExpireTime = (row: ShopList_ResulItem) => {
  const kefuFunc = getKefuFunc(row)
  if (!kefuFunc || !kefuFunc.end_time) return '未购买'
  return getRemainDaysText(kefuFunc.end_time)
}

/**
 * 获取 IMZDHF 到期时间显示（IM 自动回复）
 * 显示为“剩余 X 天”
 */
const getImzdhfExpireTime = (row: ShopList_ResulItem) => {
  const imzdHfFunc = getImzdHfFunc(row)
  if (!imzdHfFunc || !imzdHfFunc.end_time) return '未购买'
  return getRemainDaysText(imzdHfFunc.end_time)
}

// 防止重复加载的标志
let isFetching = false
// 是否在切换店铺类型（用于决定是否保持旧数据）
let isChangingShopType = false

/**
 * 获取店铺列表
 * @param keepOldData 是否保持旧数据直到新数据加载完成（用于避免页面闪烁）
 */
const fetchShopList = async (keepOldData = false) => {
  // 如果正在加载中，直接返回，避免重复加载
  if (isFetching) {
    return
  }

  isFetching = true

  // 如果不需要保持旧数据，立即显示 loading
  // 如果需要保持旧数据（切换店铺类型时），不显示 loading，保持旧数据可见
  if (!keepOldData) {
    listLoading.value = true
  }

  try {
    const result = await apiManager.shopmgApi.GetShopList({
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      filter: {
        shopType: queryForm.shopType,
        word: queryForm.searchText || undefined,
        func_code: 'KEFU',
        func_state: queryForm.kefuStatus,
        ck_online: queryForm.ckOnline,
        state: queryForm.state,
      },
    })

    // 初始化功能开关状态
    const newShopList = (result?.rows || []).map((item: any) => {
      // 确保 func_info 是数组
      if (!Array.isArray(item.func_info)) {
        item.func_info = []
      }

      const kefuFunc = item.func_info.find((f: any) => f.code === 'KEFU')
      const imzdHfFunc = item.func_info.find((f: any) => f.code === 'IMZDHF')

      // KEFU 开关状态
      item.KEFU = kefuFunc?.enable || false

      // IMZDHF 开关状态
      item.IMZDHF = imzdHfFunc?.enable || false

      // 确保 MgAgencys 始终是数组
      if (!Array.isArray(item.MgAgencys)) {
        item.MgAgencys = []
      }

      return item
    })

    // 使用 nextTick 确保 DOM 更新平滑，避免闪烁
    await nextTick()
    // 直接更新数据，保持平滑过渡
    shopList.value = newShopList
    total.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取店铺列表失败', 'error', 'hey')
    shopList.value = []
    total.value = 0
  } finally {
    listLoading.value = false
    isFetching = false
  }
}

/**
 * 店铺类型改变
 */
const handleShopTypeChange = (shopType: ShopType) => {
  // 如果店铺类型没有变化，不执行任何操作
  if (queryForm.shopType === shopType) {
    return
  }

  // 如果正在加载中，直接返回，避免重复调用
  if (isFetching) {
    return
  }

  // 如果正在切换中，直接返回，避免重复调用
  if (isChangingShopType) {
    return
  }

  isChangingShopType = true

  // 先设置标志，防止 watch 监听器触发重复加载
  // 然后更新查询条件
  queryForm.shopType = shopType
  queryForm.page = 1

  // 立即调用 fetchShopList，不等待 nextTick
  // 这样可以确保在 watch 监听器触发之前就设置好 isFetching 标志
  // 切换店铺类型时保持旧数据，避免页面闪烁
  fetchShopList(true).finally(() => {
    // 使用 nextTick 确保在下一个事件循环中重置标志
    nextTick(() => {
      isChangingShopType = false
    })
  })
}

/**
 * 获取授权状态筛选显示文本
 */
const getOnlineFilterText = () => {
  return queryForm.online || '全部'
}

/**
 * 获取 IM 客服状态筛选显示文本
 */
const getKefuFilterText = () => {
  if (!queryForm.kefuStatus) return '全部'

  switch (queryForm.kefuStatus) {
    case Filter_FuncState.未到期:
      return '未到期'
    case Filter_FuncState.即将到期:
      return '即将到期'
    case Filter_FuncState.已经到期:
      return '已到期'
    case Filter_FuncState.功能已开启:
      return '已开启'
    case Filter_FuncState.功能已关闭:
      return '已关闭'
    default:
      return '全部'
  }
}

/**
 * 授权状态改变
 */
const handleChangeOnline = (value: string) => {
  queryForm.online = value
  if (value === '全部') {
    queryForm.ckOnline = undefined
    queryForm.state = undefined
  } else if (value === '授权正常') {
    queryForm.ckOnline = true
    queryForm.state = undefined
  } else if (value === '授权异常') {
    queryForm.ckOnline = undefined
    queryForm.state = 3 // ShopState.店铺已掉线
  }
  handleSearch()
}

/**
 * IM 客服状态筛选改变
 */
const handleChangeKefuStatus = (value: string | Filter_FuncState) => {
  if (value === '全部') {
    queryForm.kefuStatus = undefined
  } else {
    queryForm.kefuStatus = value as Filter_FuncState
  }
  handleSearch()
}

/**
 * 搜索
 */
const handleSearch = () => {
  queryForm.page = 1
  fetchShopList()
}

/**
 * 重置
 */
const handleReset = () => {
  queryForm.online = '全部'
  queryForm.searchText = ''
  queryForm.shopType = ShopType.美团
  queryForm.kefuStatus = undefined
  queryForm.ckOnline = undefined
  queryForm.state = undefined
  queryForm.page = 1
  fetchShopList()
}

/**
 * 下拉菜单命令处理
 */
const handleDropdownCommand = (command: { action: string; shopType: ShopType }) => {
  if (command.action === 'bind') {
    bindShopCode(command.shopType)
  } else if (command.action === 'auth') {
    openManualAuthWindow(command.shopType)
  }
}

/**
 * 绑定店铺
 */
const bindShopCode = (shopType?: ShopType) => {
  // 如果传入了店铺类型，先切换到该类型
  if (shopType !== undefined) {
    queryForm.shopType = shopType
  }

  ElMessageBox.prompt('请输入绑定码', '提示', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    inputPattern: /\S+/,
    inputType: 'number',
    inputErrorMessage: '请输入绑定码'
  })
    .then(({ value }) => {
      if (value) {
        bindShop(value).then((res: any) => {
          if (res.code === 200) {
            gp.$baseMessage('绑定成功!', 'success', 'hey')
            showShopMsg.value = {
              name: res.data.name,
              office_id: res.data.office_id,
              shop_type: queryForm.shopType,
              shop_user: res?.info?.u,
              shop_pwd: res?.info?.p,
              cookies: res.cookies,
              reset_power: false
            }
            showShopMsgState.value = true
            isBind.value = false
            // 刷新店铺列表
            fetchShopList()
          }
        })
      }
    })
    .catch(() => { })
}

/**
 * 关闭绑定店铺成功对话框
 */
const closeShopAfter = () => {
  showShopMsgState.value = false
  // 刷新店铺列表
  fetchShopList()
}

/**
 * 手动授权
 */
const openManualAuthWindow = async (shopType?: ShopType) => {
  const electron = (globalThis as any).electron
  if (!electron || !electron.openAuthWindow) {
    gp.$baseMessage('当前环境不支持手动授权操作', 'error', 'hey')
    return
  }

  // 如果传入了店铺类型，使用传入的类型，否则使用当前选中的类型
  const targetShopType = shopType !== undefined ? shopType : queryForm.shopType

  const platformNames: Record<number, string> = {
    1: '美团外卖',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售',
    8: '饿了么官方'
  }

  try {
    const result = await electron.openAuthWindow({
      shopType: targetShopType,
      name: platformNames[targetShopType] || '店铺'
    })

    if (result.success) {
      gp.$baseMessage('授权窗口已打开，请登录后点击"授权店铺"按钮', 'success', 'hey')
    } else {
      gp.$baseMessage(result.message || '打开授权窗口失败', 'error', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage('打开授权窗口异常: ' + error.message, 'error', 'hey')
  }
}

/**
 * 打开店铺后台
 * 使用全局统一的 openShopWindow 函数，会自动获取最新 cookies
 */
const openWindow = async (row: ShopItemWithSwitch) => {
  await openShopWindow(row)
}

/**
 * 分页
 */
const handleCurrentChange = (page: number) => {
  queryForm.page = page
  fetchShopList()
}

const handleSizeChange = (size: number) => {
  queryForm.pageSize = size
  queryForm.page = 1
  fetchShopList()
}

/**
 * KEFU 开关切换
 */
const handleKefuSwitchChange = async (row: ShopItemWithSwitch) => {
  const newState = row.KEFU
  const oldState = !newState
  const action = newState ? '开启' : '关闭'

  try {
    listLoading.value = true

    // 启用/禁用 KEFU 功能
    await apiManager.functionuserApi.Enable_func({
      code: 'KEFU',
      enable: newState,
      shop: row.id,
      close_depends: false
    })

    gp.$baseMessage(`${action}IM客服成功`, 'success', 'hey')
    fetchShopList()
  } catch (error: any) {
    // 操作失败，恢复开关状态
    row.KEFU = oldState
    gp.$baseMessage(error?.message || `${action}IM客服失败`, 'error', 'hey')
  } finally {
    listLoading.value = false
  }
}

/**
 * IMZDHF 开关切换
 */
const handleImzdhfSwitchChange = async (row: ShopItemWithSwitch) => {
  const newState = row.IMZDHF
  const oldState = !newState
  const action = newState ? '开启' : '关闭'

  try {
    listLoading.value = true

    // 启用/禁用 IMZDHF 功能
    await apiManager.functionuserApi.Enable_func({
      code: 'IMZDHF',
      enable: newState,
      shop: row.id,
      close_depends: false
    })

    gp.$baseMessage(`${action}IM自动回复成功`, 'success', 'hey')
    fetchShopList()
  } catch (error: any) {
    // 操作失败，恢复开关状态
    row.IMZDHF = oldState
    gp.$baseMessage(error?.message || `${action}IM自动回复失败`, 'error', 'hey')
  } finally {
    listLoading.value = false
  }
}

/**
 * 打开 IM 自动回复设置（同门店管理里的“回复设置”）
 */
const openImAutoReplySetting = (row: ShopItemWithSwitch) => {
  // IM 自动回复功能已到期时，提示续费（与门店管理逻辑保持一致可后续扩展）
  // 这里默认直接打开设置抽屉
  drawerState.value = true
  currentRow.value = row
  drawerFun.value = 'IMZDHF'
}

const closeDrawer = () => {
  drawerState.value = false
}

/**
 * 总开关 - 关闭 KEFU 及其依赖功能
 */
const handleCloseAll = async (row: ShopItemWithSwitch) => {
  try {
    listLoading.value = true

    // 关闭 KEFU 功能，并设置 close_depends 为 true
    await apiManager.functionuserApi.Enable_func({
      code: 'KEFU',
      enable: false,
      shop: row.id,
      close_depends: true
    })

    gp.$baseMessage('已关闭IM客服及其依赖功能', 'success', 'hey')
    fetchShopList()
  } catch (error: any) {
    gp.$baseMessage(error?.message || '关闭失败', 'error', 'hey')
  } finally {
    listLoading.value = false
  }
}

/**
 * 打开续费对话框
 * 续费使用功能代码 KEFU，功能价格是 "IM客服"
 */
const handleRenew = (row: ShopItemWithSwitch) => {
  shopData.value = row
  payTypeText.value = 'IM客服'
  payDialogState.value = true
}

/**
 * 关闭支付对话框
 */
const closePayDialog = () => {
  payDialogState.value = false
}

/**
 * 支付成功回调
 */
const paySuccess = () => {
  payDialogState.value = false
  gp.$baseMessage('续费成功', 'success', 'hey')
  fetchShopList()
}

/**
 * 显示绑定用户列表
 */
const handleShowBindList = async (row: ShopItemWithSwitch) => {
  try {
    bindListLoading.value = true
    bindListDialogVisible.value = true
    currentShopRow.value = row

    const result = await apiManager.shopmgApi.GetShopBindInfo(row.id)
    currentShopBindInfo.value = result
    bindListData.value = result.BindList || []
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取绑定用户列表失败', 'error', 'hey')
    bindListData.value = []
  } finally {
    bindListLoading.value = false
  }
}

/**
 * 判断是否可以移除绑定
 * 只有非当前登录用户的绑定才显示移除按钮
 */
const canRemoveBind = (bindItem: ShopUserBindItem) => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return false
  // 如果是当前登录用户自己，不显示移除按钮
  return bindItem.id !== currentUserId
}

/**
 * 移除绑定
 */
const handleRemoveBind = async (bindItem: ShopUserBindItem) => {
  if (!currentShopRow.value) return

  try {
    await ElMessageBox.confirm(
      `确定要移除用户"${bindItem.user_name}"的绑定吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    bindListLoading.value = true
    await apiManager.shopmgApi.UnShopBind(currentShopRow.value.id, bindItem.id)

    gp.$baseMessage('移除绑定成功', 'success', 'hey')

    // 重新获取绑定列表
    await handleShowBindList(currentShopRow.value)

    // 刷新店铺列表
    fetchShopList()
  } catch (error: any) {
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '移除绑定失败', 'error', 'hey')
    }
  } finally {
    bindListLoading.value = false
  }
}

onMounted(() => {
  fetchShopList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  overflow: hidden;
}

.screen-container {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.shop-type-nav {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  margin-bottom: 16px;
  flex-wrap: wrap;
  position: relative;

  .shop-type-list {
    display: inline-flex;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
  }

  :deep(.el-dropdown) {
    display: inline-block;
  }

  .shop-type-search {
    margin-left: 12px;
    padding-bottom: 0;
    display: flex;
    align-items: stretch;
    height: 34px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    :deep(.el-input) {
      height: 100%;
    }

    // 让搜索框高度与店铺类型选择器一致
    :deep(.el-input__wrapper) {
      height: 100%;
      min-height: 100%;
      padding-top: 0;
      padding-bottom: 0;
      box-shadow: none;
      border: none;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
    }
  }

  .shop-type-item {
    height: 32px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 16px;
    border-radius: 0;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    color: #606266;
    position: relative;
    margin-right: 0;
    background-color: transparent;
    transition:
      background-color 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
      color 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      color: #409eff;
    }

    &.active {
      background-color: #409eff;
      color: #fff;
      font-weight: 500;
      box-shadow: none;
      z-index: 1;

      .shop-type-label {
        color: #fff;
        font-weight: 600;
        transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }

    .shop-type-label {
      white-space: nowrap;
      font-weight: 500;
      transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
  }

  // 下拉菜单样式
  :deep(.shop-type-dropdown-menu) {
    padding: 8px;
    min-width: 140px;

    .el-dropdown-menu__item {
      padding: 4px;
      line-height: 1;
      border-radius: 4px;

      &:hover {
        background-color: transparent;
      }

      .dropdown-button {
        width: 100%;
        justify-content: flex-start;
        margin: 0;
        border-radius: 4px;
        font-weight: normal;
      }

      &.dropdown-item-auth {
        margin-bottom: 4px;

        .dropdown-button {
          border-color: var(--el-color-success);
        }
      }

      &.dropdown-item-bind {
        .dropdown-button {
          border-color: var(--el-color-primary);
        }
      }
    }
  }
}

// 店铺状态表头样式
.shop-status-header {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .header-label {
    // 保持文字在中心位置，不受右侧按钮影响
    flex: 1;
    text-align: center;
  }

  .header-filter-dropdown {
    position: absolute;
    left: calc(50% + 35px); // 从中心偏右开始，留出"店铺状态"文字的空间
    right: 0; // 确保按钮右侧不会超出容器
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    white-space: nowrap;
    // 确保按钮内容向右扩展但不超过容器
    max-width: calc(50% - 35px);
  }
}

// 筛选按钮样式
.filter-button {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #409eff !important;
  color: #fff !important;
  border-color: #409eff !important;

  &:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
    color: #fff !important;
  }

  &:focus {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
  }

  &:active {
    background-color: #3a8ee6 !important;
    border-color: #3a8ee6 !important;
    color: #fff !important;
  }

  .el-icon {
    font-size: 12px;
    color: #fff !important;
  }
}

// 授权状态 / IM 客服状态筛选下拉菜单样式
:deep(.online-filter-menu) {
  min-width: 70px;
  width: auto;
  padding: 4px 6px;

  .el-dropdown-menu__item {
    padding: 4px 6px;

    &.is-selected {
      color: var(--el-color-primary);
      font-weight: 500;
      background-color: var(--el-color-primary-light-9);
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

.shop-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .item-shop {
    display: flex;
    align-items: flex-start;

    .item-right {
      flex: 1;

      .item-name {
        display: flex;
        align-items: center;
        color: var(--el-color-primary);
        font-size: 14px;
        font-weight: normal;
        margin-bottom: 6px;
        cursor: pointer;

        .logo {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }

        .name-text {
          flex: 1;
        }
      }

      .item-office-id,
      .item-remark {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
    }
  }

  .city-name {
    margin-left: 4px;
  }

  .shop-state {
    margin-left: 4px;
    font-size: 14px;
  }

  .state-text {
    display: flex;
    align-items: center;
    font-size: 14px;

    .suc-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #67c23a;
      margin-right: 6px;
    }

    .err-dot {
      background-color: #f56c6c;
    }
  }

  .kefu-status {
    margin: 6px 0;
    font-size: 14px;
    color: #606266;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: bold;
  }

  .text-warning {
    color: #e6a23c;
    font-weight: bold;
  }

  .pointer {
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .item-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .fun-renew {
      font-size: 14px;
      color: var(--el-color-primary);
      cursor: pointer;

      &:hover {
        opacity: 0.8;
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

.blur-image {
  filter: blur(3px);
  user-select: none;
}

// 分页组件数字模糊效果（仅在演示模式下生效）
:deep(.vab-pagination) {
  &.demo-mode {

    // 总数
    .el-pagination__total {
      filter: blur(3px);
      user-select: none;
    }

    // 每页条数选择器
    .el-pagination__sizes {
      .el-select .el-input__inner {
        filter: blur(3px);
        user-select: none;
      }
    }

    // 页码按钮
    .el-pager {
      li {
        filter: blur(3px);
        user-select: none;
      }
    }

    // 跳转输入框
    .el-pagination__jump {
      .el-input__inner {
        filter: blur(3px);
        user-select: none;
      }
    }

    // 上一页/下一页按钮（如果包含数字）
    .btn-prev,
    .btn-next {
      filter: blur(3px);
      user-select: none;
    }
  }
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
</style>