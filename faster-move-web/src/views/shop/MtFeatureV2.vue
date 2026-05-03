<template>
  <div class="page-container">
    <div class="screen-container">
      <!-- 店铺类型导航栏 -->
      <div class="shop-type-nav">
        <div class="shop-type-list">
          <div v-for="option in shopTypeOptions" :key="option.value" class="shop-type-item"
            :class="{ active: currentShopType === option.value }" @click.stop="handleShopTypeChange(option.value)">
            <PlatformIcon :shop-type="option.value" :size="20" />
            <span class="shop-type-label">{{ option.label }}</span>
          </div>
        </div>
        <!-- 搜索框和导出按钮 -->
        <div class="shop-type-search">
          <el-input v-model="queryParams.filter.word" clearable placeholder="搜索门店名称或ID或备注" style="width: 220px"
            @change="handleSearch" />
          <el-button type="primary" :icon="Download" @click="handleExportShops" :loading="exportLoading"
            style="margin-left: 12px">
            导出门店
          </el-button>
        </div>
      </div>

      <!-- 版本选择和操作按钮 -->
      <div class="version-actions-bar">
        <div class="version-buttons">
          <el-button v-if="showBasicVersion" :type="versionType === '基础版' ? 'primary' : 'default'"
            @click="versionType = '基础版'" class="version-button">
            {{ basicVersionDisplayName }}
          </el-button>
          <el-button v-if="showFunctionalVersion" :type="versionType === '功能版' ? 'primary' : 'default'"
            @click="switchToFunctional" class="version-button">
            功能版
          </el-button>
          <el-button v-if="showOperationVersion" :type="versionType === '运营版' ? 'primary' : 'default'"
            @click="switchToOperation" class="version-button">
            运营版
          </el-button>
          <div class="action-buttons">
            <AuthButton :shop-type="currentShopType" @refresh="getShopList(queryParams)"
              @shop-added="handleShopAdded" @bind="bindShopCode()" />
            <el-button type="primary" @click="openGroupManagement">
              <el-icon style="margin-right: 4px">
                <Folder />
              </el-icon>
              分组管理
            </el-button>
          </div>
        </div>
        <!-- 基础版：多开功能状态卡片（移到回收站左边） -->
        <div class="operate-status-card">
          <div class="status-entry warning" @click="openExpiringDialog">
            <span class="status-label">多开即将到期：</span>
            <span class="status-number" :class="{ 'blur-text': demoMode }">{{ expiringShopCount }}</span>
            <span class="status-unit">家店铺</span>
            <el-button :type="batchRenewMode ? 'warning' : 'primary'" size="small" class="batch-renew-btn"
              @click.stop="toggleBatchRenewMode">
              <el-icon style="margin-right: 4px">
                <Tickets />
              </el-icon>
              {{ batchRenewMode ? '取消批量续费' : '批量续费' }}
            </el-button>
            <el-button v-if="batchRenewMode && selectedShopsForRenew.length > 0" type="primary" size="small"
              class="confirm-renew-btn" @click.stop="handleConfirmRenew">
              <el-icon style="margin-right: 4px">
                <Check />
              </el-icon>
              确认续费
            </el-button>
          </div>
          <div class="status-entry danger" @click="openAuthErrorDialog">
            <span class="status-label">授权异常：</span>
            <span class="status-number" :class="{ 'blur-text': demoMode }">{{ authErrorShopCount }}</span>
            <span class="status-unit">家店铺</span>
          </div>
        </div>
        <el-button :icon="Delete" type="danger" @click="openRecycle" class="recycle-btn">回收站</el-button>
      </div>
    </div>
    <screen :query-params="queryParams.filter" :shop-type="currentShopType"
      :shop-type-str="getShopTypeStr(currentShopType)" @update-query-params="setParams" />
    <div class="shop-table-wrapper">
      <shop-table ref="shopTableRef" :list-loading="tableLoading" :page="queryParams.page"
        :page-size="queryParams.pageSize" :shop-list="shopList" :shop-type="currentShopType"
        :shop-type-str="getShopTypeStr(currentShopType)" :total="total" :batch-renew-mode="batchRenewMode"
        @update-page="updatePage" @update-filter="handleFilterChange" @save-scroll="handleSaveScroll"
        @sort-change="handleTableSort" @shop-selection-change="handleShopSelectionChange" />
    </div>
    <!-- 回收站 -->
    <recycle v-if="recycleState" :recycle-state="recycleState" :shop-type="currentShopType"
      :shop-type-str="getShopTypeStr(currentShopType)" @close-recycle="closeRecycle"
      @shop-recovered="handleShopRecovered" />
    <!-- 添加店铺相关 -->
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <!-- 分组管理对话框 -->
    <el-dialog v-model="groupManagementState" :before-close="closeGroupManagement" :destroy-on-close="true"
      width="800px" class="group-management-dialog">
      <template #header>
        <div class="group-management-header">
          <span>分组管理</span>
        </div>
      </template>
      <div class="group-management-content">
        <div class="group-list-header">
          <span class="group-list-title">分组列表</span>
          <el-button type="primary" @click="openAddGroupDialog">
            <el-icon style="margin-right: 4px">
              <Plus />
            </el-icon>
            添加分组
          </el-button>
        </div>
        <div class="group-table-wrapper">
          <el-table :data="groupManagementList" border style="width: 100%">
            <el-table-column prop="name" label="分组名称" align="left" />
            <el-table-column prop="shopCount" label="门店数量" align="center" />
            <el-table-column label="操作" align="right" width="200">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewGroupShops(row)">查看</el-button>
                <el-button type="primary" link @click="editGroupItem(row)">编辑</el-button>
                <el-button type="danger" link @click="deleteGroupItem(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <!-- 添加/编辑分组对话框 -->
    <el-dialog v-model="addGroupState" :before-close="closeGroup" :destroy-on-close="true"
      :title="groupForm.id ? '编辑分组' : '添加分组'" width="500px">
      <div style="padding-bottom: 40px">
        <el-form ref="groupFormRef" label-width="100" :model="groupForm" :rules="groupRules">
          <el-form-item v-if="groupForm.parentName" label="上级分组">
            <el-input v-model="groupForm.parentName" disabled />
          </el-form-item>
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="groupForm.name" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="confirmGroup">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <!-- 批量续费对话框 -->
    <BatchRenewDialog v-model="batchRenewDialogVisible" :shop-list="selectedShopsForRenew" :shop-type="currentShopType"
      :function-code="selectedFunctionCode" :function-name="selectedFunctionName" @renew-success="handleRenewSuccess" />
    <!-- 即将到期店铺对话框 -->
    <el-dialog v-model="expiringDialogVisible" title="多开即将到期店铺" width="1000px" :before-close="closeExpiringDialog"
      destroy-on-close>
      <div class="expiring-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ expiringTotal }} 家店铺即将到期（7天内）</span>
          <el-button type="primary" :disabled="selectedExpiringShops.length === 0" @click="batchRenewExpiringShops">
            批量续费 ({{ selectedExpiringShops.length }})
          </el-button>
        </div>
        <el-table :data="expiringShopList" v-loading="expiringLoading" @selection-change="handleExpiringSelectionChange"
          border max-height="500px">
          <el-table-column type="selection" width="55" />
          <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }" class="shop-name-cell">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="150">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }" class="shop-id-cell">{{ row.office_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" width="180">
            <template #default="{ row }">
              <span :class="{ 'expired-text': isExpired(row) }">
                {{ getExpiringTime(row) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="renewSingleShop(row)">续费</el-button>
            </template>
          </el-table-column>
        </el-table>
        <vab-pagination :current-page="expiringPage" :page-size="expiringPageSize" :total="expiringTotal"
          @current-change="handleExpiringPageChange" @size-change="handleExpiringSizeChange"
          style="margin-top: 16px;" />
      </div>
    </el-dialog>
    <!-- 授权异常店铺对话框 -->
    <el-dialog v-model="authErrorDialogVisible" title="授权异常店铺" width="900px" :before-close="closeAuthErrorDialog"
      destroy-on-close>
      <div class="auth-error-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ authErrorTotal }} 家店铺授权异常</span>
        </div>
        <el-table :data="authErrorShopList" v-loading="authErrorLoading" border max-height="500px">
          <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }" class="shop-name-cell">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="150">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }" class="shop-id-cell">{{ row.office_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上次授权时间" prop="ck_uptime" width="180" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="fixAuth(row)"
                :loading="fixingAuthIds.includes(row.id)">修复</el-button>
            </template>
          </el-table-column>
        </el-table>
        <vab-pagination :current-page="authErrorPage" :page-size="authErrorPageSize" :total="authErrorTotal"
          @current-change="handleAuthErrorPageChange" @size-change="handleAuthErrorSizeChange"
          style="margin-top: 16px;" />
      </div>
    </el-dialog>
    <!-- 查看分组店铺对话框 -->
    <el-dialog v-model="viewGroupShopsDialogVisible" :title="`查看分组：${currentViewGroup?.name || ''}`" width="900px"
      :before-close="closeViewGroupShopsDialog" destroy-on-close>
      <div class="view-group-shops-dialog">
        <div class="dialog-header-info">
          <span>共 {{ groupShopList.length }} 家店铺</span>
        </div>
        <div class="table-wrapper">
          <el-table :data="groupShopList" v-loading="groupShopLoading" border height="400"
            @selection-change="handleGroupShopSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip />
            <el-table-column label="门店ID" prop="office_id" width="150" />
            <el-table-column label="当前分组" width="150">
              <template #default="{ row }">
                <span>{{ row.group_name || '未分组' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="changeShopGroup(row)">修改分组</el-button>
                <el-button type="danger" size="small" @click="removeShopFromGroup(row)">从分组移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="dialog-footer-actions" v-if="selectedGroupShops.length > 0">
          <el-button type="primary" @click="batchChangeShopGroup">批量修改分组 ({{ selectedGroupShops.length }})</el-button>
          <el-button type="danger" @click="batchRemoveShopFromGroup">批量移除 ({{ selectedGroupShops.length }})</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 修改店铺分组对话框 -->
    <el-dialog v-model="changeShopGroupDialogVisible" title="修改分组" width="500px"
      :before-close="closeChangeShopGroupDialog" destroy-on-close>
      <div class="change-shop-group-dialog">
        <el-form label-width="100px">
          <el-form-item label="选择分组">
            <el-select v-model="targetGroupId" placeholder="请选择分组" style="width: 100%" clearable>
              <el-option label="未分组" :value="0" />
              <el-option v-for="group in allGroupOptions" :key="group.value" :label="group.label"
                :value="group.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button @click="closeChangeShopGroupDialog">取消</el-button>
              <el-button type="primary" :loading="changeGroupLoading" @click="confirmChangeShopGroup">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import Screen from "/@/views/shop/componentsV2/Screen.vue";
import { getShop, getShopFdmv, bindShop, addShop, getGroup } from "/@/api/shop.ts";
import { addGroup, updateGroup, delGroup } from '/@/api/group.ts'
import { getBindShopList, connectShopUserGroup, connectShopUserRemoveGroup } from '/@/api/group.ts'
import ShopTable from "/@/views/shop/componentsV2/ShopTable.vue";
import { useRoute, useRouter } from 'vue-router';
import { watch, nextTick, computed, ref, reactive, onMounted, onActivated, onBeforeMount, onBeforeUnmount } from 'vue';
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { Key, Delete, Plus, Tickets, Check, Folder, Download } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { gp } from '/@vab/plugins/vab'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { openShopWindow } from '/@/utils/openShopWin'
import recycle from '/@/views/shop/componentsV2/Recycle.vue'
import BatchRenewDialog from '/@/views/shop/componentsV2/BatchRenewDialog.vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { OrderDirection } from '/@/TsModel/Alien/Controllers/Shop/OrderDirection'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { getRenewFunctionList } from '/@/utils/functionCache.ts'

// 确保 vab-icon 可用（全局组件）

const route = useRoute()
const router = useRouter()

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 检查是否在Electron环境中
const isElectron = !!((globalThis as any).electron)

// 店铺类型选项（按照门店管理的顺序）
const shopTypeOptions = [
  { label: '美团餐饮', value: ShopType.美团 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿了么餐饮', value: ShopType.饿了么 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 },
]

// 当前选中的店铺类型（从 sessionStorage 恢复，如果没有则默认为美团）
const getSavedShopType = (): ShopType => {
  try {
    const saved = sessionStorage.getItem('mtFeatureV2_currentShopType')
    if (saved) {
      const shopType = parseInt(saved, 10) as ShopType
      // 验证是否是有效的店铺类型
      if (shopTypeOptions.some(opt => opt.value === shopType)) {
        return shopType
      }
    }
  } catch (error) {
    console.error('读取保存的店铺类型失败:', error)
  }
  return ShopType.美团
}

const currentShopType = ref<ShopType>(getSavedShopType())

// 保存当前选中的店铺类型到 sessionStorage
const saveCurrentShopType = (shopType: ShopType) => {
  try {
    sessionStorage.setItem('mtFeatureV2_currentShopType', shopType.toString())
  } catch (error) {
    console.error('保存店铺类型失败:', error)
  }
}

// 版本类型（基础版、功能版、运营版）
const versionType = ref('功能版')

// 判断是否显示基础版按钮（只有饿了么复制版和抖音即时零售显示基础版按钮）
const showBasicVersion = computed(() => {
  const onlyBasicVersionTypes = [ShopType.饿了么官方, ShopType.抖店即时零售]
  return onlyBasicVersionTypes.includes(currentShopType.value)
})

// 判断是否显示功能版按钮（饿了么复制版和抖音即时零售不显示功能版按钮）
const showFunctionalVersion = computed(() => {
  // 饿了么复制版和抖音即时零售只有基础版，不显示功能版
  const onlyBasicVersionTypes = [ShopType.饿了么官方, ShopType.抖店即时零售]
  return !onlyBasicVersionTypes.includes(currentShopType.value)
})

// 基础版按钮显示名称（饿了么复制版和抖音即时零售显示为"功能版"）
const basicVersionDisplayName = computed(() => {
  const onlyBasicVersionTypes = [ShopType.饿了么官方, ShopType.抖店即时零售]
  if (onlyBasicVersionTypes.includes(currentShopType.value)) {
    return '功能版'
  }
  return '基础版'
})

// 判断是否显示运营版按钮（美团餐饮、美团闪购、京东到家有运营版功能）
const showOperationVersion = computed(() => {
  return currentShopType.value === ShopType.美团 || currentShopType.value === ShopType.美团闪购 || currentShopType.value === ShopType.京东到家
})

// 切换到功能版
const switchToFunctional = () => {
  router.push('/shop-v2/functional')
}

// 切换到运营版
const switchToOperation = () => {
  // 进入运营版前，同步当前店铺类型给运营版页面（避免运营版页读取到旧的 mtFeatureV2Operation_currentShopType 而误重定向）
  try {
    sessionStorage.setItem('mtFeatureV2Operation_currentShopType', currentShopType.value.toString())
  } catch { }
  router.push('/shop-v2/operation')
}

// 获取店铺类型字符串
const getShopTypeStr = (shopType: ShopType): string => {
  const typeMap: Record<number, string> = {
    1: 'mt-feature',
    2: 'elm-feature',
    3: 'mt-shop-feature',
    4: 'mt-medicine-feature',
    5: 'elm-retail-feature',
    6: 'jd-home-feature',
    7: 'dy-retail-feature',
    8: 'elm-feature', // 饿了么官方使用相同的 typeStr
    1000: 'mt-feature', // 美团团购使用美团的 typeStr
    1001: 'jd-home-feature', // 京东团购使用京东到家的 typeStr
  }
  return typeMap[shopType] || 'mt-feature'
}

const tableLoading = ref(false)
const total = ref(0)
const shopList = ref<any[]>([])

// 防止重复加载的标志
let isFetching = false
// 是否在切换店铺类型（用于决定是否保持旧数据）
let isChangingShopType = false

// 为每种店铺类型保存独立的状态
interface ShopTypeState {
  page: number
  pageSize: number
  filter: {
    time_state?: number
    shopType: ShopType
    word?: string
    group?: number
    state?: number
    ck_online?: number
    citys?: string[]
    func_code?: string
    func_state?: number
    avtag?: number
  }
  order_by?: string
  order_direction?: OrderDirection
  scrollPosition?: number
}

// 店铺类型状态存储 Map<ShopType, ShopTypeState>
const shopTypeStates = ref<Map<ShopType, ShopTypeState>>(new Map())

// 获取指定店铺类型的状态，如果不存在则创建默认状态
const getShopTypeState = (shopType: ShopType): ShopTypeState => {
  if (!shopTypeStates.value.has(shopType)) {
    shopTypeStates.value.set(shopType, {
      page: 1,
      pageSize: 20,
      filter: {
        time_state: undefined,
        shopType: shopType,
        word: undefined,
        group: undefined,
        state: undefined,
        ck_online: undefined,
        citys: undefined,
        func_code: undefined,
        func_state: undefined,
        avtag: undefined
      },
      order_by: undefined,
      order_direction: undefined,
      scrollPosition: 0
    })
  }
  return shopTypeStates.value.get(shopType)!
}

// 保存当前店铺类型的状态
const saveCurrentShopTypeState = () => {
  const state = getShopTypeState(currentShopType.value)
  state.page = queryParams.page
  state.pageSize = queryParams.pageSize
  state.filter = { ...queryParams.filter }
  state.order_by = queryParams.order_by
  state.order_direction = queryParams.order_direction
  // 滚动位置由 ShopTable 组件通过事件传递
}

// 恢复指定店铺类型的状态
const restoreShopTypeState = (shopType: ShopType) => {
  // 如果正在重置，不恢复状态
  if (getIsResetting()) {
    return 0
  }

  const state = getShopTypeState(shopType)

  queryParams.page = state.page
  queryParams.pageSize = state.pageSize
  queryParams.filter = { ...state.filter, shopType: shopType }
  queryParams.order_by = state.order_by
  queryParams.order_direction = state.order_direction

  // 确保 currentShopType 也同步更新
  if (currentShopType.value !== shopType) {
    currentShopType.value = shopType
    saveCurrentShopType(shopType)
  }
  return state.scrollPosition || 0
}

// 功能版
defineOptions({
  name: 'MtFeatureV2',
})
const queryParams = reactive<{
  page: number
  pageSize: number
  filter: {
    time_state?: number
    shopType: ShopType
    word?: string
    group?: number
    state?: number
    ck_online?: number
    citys?: string[]
    func_code?: string
    func_state?: number
    avtag?: number
  }
  order_by?: string
  order_direction?: OrderDirection
}>({
  page: 1,
  pageSize: 20,
  filter: {
    time_state: undefined,
    shopType: currentShopType.value,
    word: undefined,
    group: undefined,
    state: undefined,
    ck_online: undefined,
    citys: undefined,
    func_code: undefined,
    func_state: undefined,
    avtag: undefined
  },
  order_by: undefined,
  order_direction: undefined
})

// 处理表格排序变化（从表格列头点击触发）
const handleTableSort = (sortInfo: { field: string; order: 'asc' | 'desc' | null }) => {

  // 更新 queryParams
  if (sortInfo.field && sortInfo.order) {
    queryParams.order_by = sortInfo.field
    queryParams.order_direction = sortInfo.order === 'asc' ? OrderDirection.Asc : OrderDirection.Desc
  } else {
    // 清空排序
    queryParams.order_by = undefined
    queryParams.order_direction = undefined
  }

  // 排序时重置页码为第一页
  queryParams.page = 1

  // 保存当前状态
  saveCurrentShopTypeState()

  // 重新加载数据
  getShopList(queryParams, true)
}

/** 将 func_info / func_enable 展平到 item：item[code]、item[code+'time']，支持后端动态功能 */
function updateFuncInfo(item: any, funcInfo: any): void {
  (funcInfo || []).forEach((func: any) => {
    if (!func?.code) return;
    item[func.code] = func?.enable ?? false;
    item[`${func.code}time`] = setTime(func?.end_time);
  });
}

const setTime = (date?: string | null): string => {
  if (date) {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) { // 检查是否是一个有效的日期
      let y = dateObj.getFullYear();
      let m: string | number = dateObj.getMonth() + 1;
      m = m < 10 ? `0${m}` : m.toString();
      let d: string | number = dateObj.getDate();
      d = d < 10 ? `0${d}` : d.toString();
      return `${y}-${m}-${d}`;
    }
  }
  return '已到期';
};

const getShopList = async (data: any, keepOldData = false) => {
  // 如果正在加载中，直接返回，避免重复加载
  if (isFetching) {
    return
  }

  isFetching = true

  // 如果不需要保持旧数据，立即显示 loading
  // 如果需要保持旧数据（切换店铺类型时），不显示 loading，保持旧数据可见
  if (!keepOldData) {
    tableLoading.value = true
  }

  try {
    // 根据版本类型选择接口：运营版使用 V2 接口（包含 extra_data），其他版本使用普通接口
    const res: any = versionType.value === '运营版'
      ? await apiManager.shopmgApi.GetShopListV2(data)
      : await apiManager.shopmgApi.GetShopList(data)
    if (res && res.rows) {
      // 优化数据处理：使用批量处理减少响应式更新
      const rows = res.rows || []

      const defaultFuncCodes = ['ZDCC', 'ZDHP', 'IMZDHF', 'ZDTG']

      // 批量处理数据，减少响应式触发
      const newShopList: any[] = new Array(rows.length)
      for (let i = 0; i < rows.length; i++) {
        const item = { ...rows[i] } // 浅拷贝避免修改原数据

        if (item.img && !item.img.startsWith('http')) {
          item.img = `http://${item.img}`
        }
        item.tooltipshow = false

        // 基础版和运营版统一：直接从 extra_data.func_enable 获取功能信息
        const funcSource = item.extra_data?.func_enable

        if (Array.isArray(funcSource) && funcSource.length > 0) {
          updateFuncInfo(item, funcSource)
        } else {
          // 批量设置默认值
          for (let j = 0; j < defaultFuncCodes.length; j++) {
            const code = defaultFuncCodes[j]
            item[code] = false
            item[`${code}time`] = '已到期'
          }
          item.CPDTtime = ""
        }

        // 确保 extra_data 中的实时数据被保留（不被覆盖）
        // extra_data 包含：income, order_num, show_num, in_ratio, order_ratio, avg_income 等
        // 这些数据已经在 item.extra_data 中，无需额外处理

        if (item.work_time?.WorkTimeList) {
          const [workTime] = item.work_time.WorkTimeList
          item.yetime = workTime ? `${workTime.Start.slice(0, -3)}-${workTime.End.slice(0, -3)}` : ''
        } else {
          item.yetime = ''
        }

        newShopList[i] = item
      }

      // 使用 nextTick 批量更新，减少响应式触发次数
      nextTick(() => {
        shopList.value = newShopList as any[]
        total.value = res.total || 0
      })
    }
  } finally {
    tableLoading.value = false
    isFetching = false
  }
}

const setParams = (data: any) => {
  // 如果正在重置，忽略来自 Screen 组件的更新
  if (getIsResetting()) {
    return
  }
  queryParams.filter = { ...data, shopType: currentShopType.value }
  // 筛选时重置页码为第一页
  queryParams.page = 1
  // 保存当前状态
  saveCurrentShopTypeState()
  // 筛选操作时，保持旧数据可见，避免闪烁
  getShopList(queryParams, true)
}

/**
 * 店铺类型改变
 */
const handleShopTypeChange = (shopType: ShopType) => {
  // 如果店铺类型没有变化，不执行任何操作
  if (currentShopType.value === shopType) {
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

  // 除了饿了么复制版和抖音即时零售，其他平台切换时自动跳转到功能版
  const onlyBasicVersionTypes = [ShopType.饿了么官方, ShopType.抖店即时零售]
  if (!onlyBasicVersionTypes.includes(shopType)) {
    // 保存当前店铺类型到 sessionStorage，以便功能版页面读取
    saveCurrentShopType(shopType)
    // 跳转到功能版页面
    router.push('/shop-v2/functional')
    return
  }

  isChangingShopType = true

  // 保存当前店铺类型的状态
  saveCurrentShopTypeState()

  // 更新当前店铺类型
  const previousShopType = currentShopType.value
  currentShopType.value = shopType
  // 保存到 sessionStorage
  saveCurrentShopType(shopType)

  // 恢复新店铺类型的状态
  const scrollPosition = restoreShopTypeState(shopType)

  // 切换店铺类型时保持旧数据，避免页面闪烁
  getShopList(queryParams, true).finally(() => {
    // 使用 nextTick 确保在下一个事件循环中重置标志
    nextTick(() => {
      isChangingShopType = false
    })
  })

  // 切换店铺类型时刷新统计数据
  initStatusCount()
}

/**
 * 绑定店铺
 */
const bindShopCode = (shopType?: ShopType) => {
  // 如果传入了店铺类型，先切换到该类型
  if (shopType !== undefined) {
    currentShopType.value = shopType
    queryParams.filter.shopType = shopType
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
              shop_type: shopType !== undefined ? shopType : currentShopType.value,
              shop_user: res?.info?.u,
              shop_pwd: res?.info?.p,
              cookies: res.cookies,
              reset_power: false
            }
            showShopMsgState.value = true
            isBind.value = true
            // 刷新店铺列表
            getShopList(queryParams)
          }
        })
      }
    })
    .catch(() => { })
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
  const targetShopType = shopType !== undefined ? shopType : currentShopType.value

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
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
    const userId = userInfo.admin?.id || ''

    const result = await electron.openAuthWindow({
      shopType: targetShopType,
      name: platformNames[targetShopType] || '店铺',
      userId
    })

    if (result.success) {
      if (targetShopType === ShopType.京东团购) {
        gp.$baseMessage('授权窗口已打开，请登录京东店铺后点击"确认授权"，系统将自动完成添加', 'success', 'hey')
      } else {
        gp.$baseMessage('授权窗口已打开，请登录后点击"授权店铺"按钮', 'success', 'hey')
      }
    } else {
      gp.$baseMessage(result.message || '打开授权窗口失败', 'error', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage('打开授权窗口异常: ' + error.message, 'error', 'hey')
  }
}

/**
 * 添加门店
 */
const showShopMsg = ref({})
const showShopMsgState = ref(false)
const isBind = ref(false)
const closeShopAfter = () => {
  showShopMsgState.value = false
}

/**
 * 处理店铺添加成功事件（来自AuthButton组件）
 */
const handleShopAdded = (shopData: any) => {
  showShopMsg.value = shopData
  showShopMsgState.value = true
  isBind.value = false
}

const openApp = async (name: any, shopType?: ShopType) => {
  // 使用传入的shopType或当前选中的shopType
  const targetShopType = shopType !== undefined ? shopType : currentShopType.value

  // 饿了么官方（shopType=8）从后端获取授权地址
  if (targetShopType === ShopType.饿了么官方) {
    try {
      const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
      window.open(authResult.Url, '_blank')
      return
    } catch (error: any) {
      gp.$baseMessage('获取授权地址失败: ' + error.message, 'error', 'hey')
      return
    }
  } else if (!isElectron) {
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
  }

  const params = {
    name: name || '',
    shop_type: targetShopType
  }

    ; (globalThis as any).electron.openBrowser(invokeMap[targetShopType as number], params, async (res: any) => {
      let data = {
        shop_type: params.shop_type,
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
              shop_user: '',
              shop_pwd: '',
              cookies: res.cookies,
              reset_power: false
            }
            showShopMsgState.value = true
            isBind.value = false
          }
          // 刷新店铺列表
          getShopList(queryParams)
        }
      })
    })
}

/**
 * 回收站
 */
const recycleState = ref(false)
const openRecycle = () => {
  recycleState.value = true
}
const closeRecycle = () => {
  recycleState.value = false
}
/**
 * 处理店铺恢复成功事件，刷新列表
 */
const handleShopRecovered = () => {
  getShopList(queryParams)
}

/**
 * 搜索
 */
const handleSearch = () => {
  queryParams.page = 1
  getShopList(queryParams)
}

// 导出相关
const exportLoading = ref(false)

// 店铺类型映射
const shopTypeMap: Record<number, string> = {
  1: '美团餐饮',
  2: '饿了么餐饮',
  3: '美团闪购',
  4: '美团医药',
  5: '饿百零售',
  6: '京东到家',
  7: '抖音即时零售',
  8: '饿了么复制版'
}

// 营业状态映射
const stateMap: Record<number, string> = {
  4: '营业中',
  5: '停业中',
  6: '上线中',
  7: '已下线',
  3: '授权异常'
}

// 导出店铺数据
const handleExportShops = async () => {
  if (exportLoading.value) return

  exportLoading.value = true
  try {
    // 分页获取所有数据
    const allShops: any[] = []
    let page = 1
    const pageSize = 1000 // 每页获取1000条
    let hasMore = true

    while (hasMore) {
      const exportParams = {
        page,
        pageSize,
        order_direction: queryParams.order_direction,
        filter: {
          ...queryParams.filter,
          shopType: currentShopType.value
        }
      }

      // 根据版本类型选择接口：运营版使用 V2 接口，其他版本使用普通接口
      const res: any = versionType.value === '运营版'
        ? await apiManager.shopmgApi.GetShopListV2(exportParams)
        : await apiManager.shopmgApi.GetShopList(exportParams)

      if (res && res.rows && res.rows.length > 0) {
        allShops.push(...res.rows)

        // 如果返回的数据少于 pageSize，说明已经是最后一页
        if (res.rows.length < pageSize || allShops.length >= (res.total || 0)) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }

    if (allShops.length === 0) {
      gp.$baseMessage('暂无数据可导出', 'warning', 'hey')
      return
    }

    // 准备导出数据
    const exportData = allShops.map((shop: any) => {
      return {
        '店铺平台类型': shopTypeMap[shop.shop_type] || '未知',
        '店铺名': shop.name || '',
        '店铺ID': shop.office_id || '',
        '店铺营业状态': stateMap[shop.state] || '未知',
        '店铺所在城市': shop.city || '',
        '门店备注': shop.notes || ''
      }
    })

    // 使用 ExcelJS 导出
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('门店列表')

    // 设置表头
    const headers = ['店铺平台类型', '店铺名', '店铺ID', '店铺营业状态', '店铺所在城市', '门店备注']
    worksheet.columns = headers.map(header => ({
      header,
      key: header,
      width: 20
    }))

    // 添加数据
    exportData.forEach((row: any) => {
      worksheet.addRow(row)
    })

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // 生成 Excel 文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const shopTypeName = shopTypeMap[currentShopType.value] || '门店'
    link.download = `${shopTypeName}列表_${timestamp}.xlsx`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    gp.$baseMessage(`成功导出 ${exportData.length} 条门店数据`, 'success', 'hey')
  } catch (error: any) {
    console.error('导出失败:', error)
    gp.$baseMessage('导出失败，请稍后重试', 'error', 'hey')
  } finally {
    exportLoading.value = false
  }
}

const updatePage = (pageObj: any) => {
  if (pageObj.page) {
    queryParams.page = pageObj.page
  }
  if (pageObj.pageSize) {
    queryParams.pageSize = pageObj.pageSize
  }
  // 保存当前状态
  saveCurrentShopTypeState()
  getShopList(queryParams)
}

// 处理筛选参数变化
const handleFilterChange = (filterData: any) => {
  // 如果正在重置，忽略筛选变化
  if (getIsResetting()) {
    return
  }
  // 合并筛选参数到 queryParams.filter，保留其他筛选条件
  Object.keys(filterData).forEach((key: string) => {
    if (filterData[key] === undefined || filterData[key] === null) {
      // 如果值为 undefined 或 null，则清除该筛选条件
      (queryParams.filter as any)[key] = undefined
    } else {
      (queryParams.filter as any)[key] = filterData[key]
    }
  })
  // 筛选时重置页码为第一页
  queryParams.page = 1
  // 保存当前状态
  saveCurrentShopTypeState()
  // 调用接口获取筛选后的数据
  getShopList(queryParams, true)
}

// ShopTable 组件引用
const shopTableRef = ref()

// 批量续费模式
const batchRenewMode = ref(false)
const selectedShopsForRenew = ref<any[]>([])
const selectedFunctionCode = ref('')
const selectedFunctionName = ref('')
const batchRenewDialogVisible = ref(false)
const functionOptions = ref<any[]>([])

// 基础版：多开功能到期提醒和授权异常
const expiringShopCount = ref(0)
const expiringShopList = ref<any[]>([])
const expiringDialogVisible = ref(false)
const expiringLoading = ref(false)
const selectedExpiringShops = ref<any[]>([])
const expiringPage = ref(1)
const expiringPageSize = ref(10) // 改为每页10条
const expiringTotal = ref(0)

const authErrorShopCount = ref(0)
const authErrorShopList = ref<any[]>([])
const authErrorDialogVisible = ref(false)
const authErrorLoading = ref(false)
const fixingAuthIds = ref<string[]>([])
const authErrorPage = ref(1)
const authErrorPageSize = ref(10) // 改为每页10条
const authErrorTotal = ref(0)

// 防止重复请求的标志
let isFetchingExpiring = false
let isFetchingAuthError = false

// 基础版：获取即将到期的店铺列表（分页懒加载，每次20条）
const getExpiringShops = async (page: number = 1) => {
  // 防止重复请求
  if (isFetchingExpiring) {
    return
  }

  try {
    isFetchingExpiring = true
    expiringLoading.value = true

    // 参考 handleMultiOpenFilter(2) 即将到期的筛选参数，使用分页
    const data: any = {
      page: page,
      pageSize: expiringPageSize.value,
      filter: {
        shopType: currentShopType.value,
        func_code: 'OPENSHOP', // 店铺多开功能
        func_state: 2, // 即将到期
        //time_state: 2, // 即将到期（映射到 EndTime 字段）
      }
    }

    // 根据版本类型选择接口：运营版使用 V2 接口，其他版本使用普通接口
    const res = versionType.value === '运营版'
      ? await apiManager.shopmgApi.GetShopListV2(data)
      : await apiManager.shopmgApi.GetShopList(data)
    if (res && res.rows) {
      expiringShopList.value = res.rows || []
      expiringTotal.value = res.total || 0
      expiringPage.value = page
    }
  } catch (error) {
    console.error('获取即将到期店铺失败:', error)
  } finally {
    expiringLoading.value = false
    isFetchingExpiring = false
  }
}

// 获取综合统计数据（授权异常 + 功能到期）
const getComprehensiveStats = async () => {
  try {
    // 🟢 使用综合统计接口 GetComprehensiveStats，一次性获取所有统计数据
    const result = await apiManager.shopmgApi.GetComprehensiveStats(currentShopType.value)

    if (result) {
      // 从功能统计中获取店铺多开即将到期的数量
      if (result.FuncCounts && result.FuncCounts['OPENSHOP']) {
        expiringShopCount.value = result.FuncCounts['OPENSHOP'].almost_end || 0
      } else {
        expiringShopCount.value = 0
      }

      // 从授权异常统计中获取当前平台的授权异常店铺数量
      if (result.AuthErrors && result.AuthErrors.length > 0) {
        // 找到当前店铺类型对应的授权异常统计
        const authError = result.AuthErrors.find(item => item.ShopType === currentShopType.value)
        authErrorShopCount.value = authError ? authError.Count : 0
      } else {
        authErrorShopCount.value = 0
      }
    } else {
      expiringShopCount.value = 0
      authErrorShopCount.value = 0
    }
  } catch (error) {
    console.error('获取综合统计数据失败:', error)
    expiringShopCount.value = 0
    authErrorShopCount.value = 0
  }
}

// 基础版：获取授权异常的店铺列表（分页懒加载，每次20条）
const getAuthErrorShops = async (page: number = 1) => {
  // 防止重复请求
  if (isFetchingAuthError) {
    return
  }

  try {
    isFetchingAuthError = true
    authErrorLoading.value = true

    // 参考 handleAuthStatusFilter('授权异常') 的筛选参数，使用分页
    const data: any = {
      page: page,
      pageSize: authErrorPageSize.value,
      filter: {
        shopType: currentShopType.value,
        ck_online: undefined, // 不筛选在线状态
        state: 3, // 授权异常
      }
    }

    // 根据版本类型选择接口：运营版使用 V2 接口，其他版本使用普通接口
    const res = versionType.value === '运营版'
      ? await apiManager.shopmgApi.GetShopListV2(data)
      : await apiManager.shopmgApi.GetShopList(data)
    if (res && res.rows) {
      authErrorShopList.value = res.rows || []
      authErrorTotal.value = res.total || 0
      authErrorPage.value = page
    }
  } catch (error) {
    console.error('获取授权异常店铺失败:', error)
  } finally {
    authErrorLoading.value = false
    isFetchingAuthError = false
  }
}

// 初始化统计数据（只获取总数，不加载详细列表）
const initStatusCount = async () => {
  await getComprehensiveStats()
}

// 获取功能列表
const loadFunctionOptions = async () => {
  try {
    functionOptions.value = await getRenewFunctionList(currentShopType.value)

    // 根据版本类型设置默认功能
    if (functionOptions.value.length > 0) {
      if (versionType.value === '基础版') {
        // 基础版默认选择"店铺多开"
        const openshop = functionOptions.value.find(item => item.code === 'OPENSHOP')
        if (openshop) {
          selectedFunctionCode.value = openshop.code
          selectedFunctionName.value = openshop.name
        } else {
          selectedFunctionCode.value = functionOptions.value[0].code
          selectedFunctionName.value = functionOptions.value[0].name
        }
      } else {
        // 其他版本默认选择第一个功能
        selectedFunctionCode.value = functionOptions.value[0].code
        selectedFunctionName.value = functionOptions.value[0].name
      }
    } else {
      console.warn('功能列表为空')
    }
  } catch (error: any) {
    console.error('获取功能列表失败:', error)
    gp.$baseMessage('获取功能列表失败: ' + (error.message || '未知错误'), 'error', 'hey')
  }
}

// 切换批量续费模式
const toggleBatchRenewMode = () => {
  batchRenewMode.value = !batchRenewMode.value
  if (!batchRenewMode.value) {
    // 退出批量续费模式时清空选中
    selectedShopsForRenew.value = []
  } else {
    // 进入批量续费模式时加载功能列表
    loadFunctionOptions()
  }
}

// 处理店铺选择变化
const handleShopSelectionChange = (shops: any[]) => {
  selectedShopsForRenew.value = shops
}

// 确认续费
const handleConfirmRenew = () => {
  if (selectedShopsForRenew.value.length === 0) {
    gp.$baseMessage('请选择要续费的店铺', 'warning', 'hey')
    return
  }
  if (!selectedFunctionCode.value) {
    gp.$baseMessage('请选择要续费的功能', 'warning', 'hey')
    return
  }
  batchRenewDialogVisible.value = true
}

// 续费成功回调
const handleRenewSuccess = () => {
  // 退出批量续费模式
  batchRenewMode.value = false
  selectedShopsForRenew.value = []
  // 刷新店铺列表
  getShopList(queryParams, false)
  // 刷新统计数据
  initStatusCount()
}

// 基础版：即将到期对话框相关
const openExpiringDialog = () => {
  expiringDialogVisible.value = true
  expiringPage.value = 1 // 重置为第一页
  getExpiringShops(1) // 加载第一页数据
}

const closeExpiringDialog = () => {
  expiringDialogVisible.value = false
  selectedExpiringShops.value = []
}

// 即将到期对话框翻页
const handleExpiringPageChange = (page: number) => {
  getExpiringShops(page)
}

const handleExpiringSizeChange = (size: number) => {
  expiringPageSize.value = size
  getExpiringShops(1)
}

const handleExpiringSelectionChange = (shops: any[]) => {
  selectedExpiringShops.value = shops
}

const batchRenewExpiringShops = () => {
  selectedShopsForRenew.value = selectedExpiringShops.value
  selectedFunctionCode.value = 'OPENSHOP'
  selectedFunctionName.value = '店铺多开'
  expiringDialogVisible.value = false
  batchRenewDialogVisible.value = true
}

const renewSingleShop = (shop: any) => {
  selectedShopsForRenew.value = [shop]
  selectedFunctionCode.value = 'OPENSHOP'
  selectedFunctionName.value = '店铺多开'
  expiringDialogVisible.value = false
  batchRenewDialogVisible.value = true
}

const isExpired = (shop: any): boolean => {
  try {
    const endDate = new Date(shop.EndTime)
    if (isNaN(endDate.getTime())) return false
    return endDate <= new Date()
  } catch {
    return false
  }
}

const getExpiringTime = (shop: any): string => {
  try {
    const endDate = new Date(shop.EndTime)
    if (isNaN(endDate.getTime())) return '无效日期'

    const now = new Date()
    const timeDiff = endDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) {
      return '已到期'
    } else if (daysDiff === 0) {
      return '今天到期'
    } else {
      return `剩余${daysDiff}天`
    }
  } catch {
    return '无效日期'
  }
}

// 基础版：授权异常对话框相关
const openAuthErrorDialog = () => {
  authErrorDialogVisible.value = true
  authErrorPage.value = 1 // 重置为第一页
  getAuthErrorShops(1) // 加载第一页数据
}

const closeAuthErrorDialog = () => {
  authErrorDialogVisible.value = false
}

// 授权异常对话框翻页
const handleAuthErrorPageChange = (page: number) => {
  getAuthErrorShops(page)
}

const handleAuthErrorSizeChange = (size: number) => {
  authErrorPageSize.value = size
  getAuthErrorShops(1)
}

// 修复授权（打开对应平台的浏览器进行授权）
const fixAuth = async (shop: any) => {
  fixingAuthIds.value.push(shop.id)
  try {
    // 饿了么官方（复制版）使用后端授权地址，不使用 electron.openBrowser
    if (shop.shop_type === ShopType.饿了么官方) {
      try {
        const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
        window.open(authResult.Url, '_blank')
        gp.$baseMessage('请在打开的页面中完成授权，完成后手动刷新列表', 'info', 'hey')
      } catch (error: any) {
        gp.$baseMessage('获取授权地址失败: ' + (error.message || '未知错误'), 'error', 'hey')
      } finally {
        fixingAuthIds.value = fixingAuthIds.value.filter(id => id !== shop.id)
      }
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
    }
    const authParams: { name: string; shop_type: number } = {
      name: shop.name || '',
      shop_type: shop.shop_type
    }
    const electron = (globalThis as any).electron
    if (electron && electron.openBrowser) {
      electron.openBrowser(invokeMap[shop.shop_type as number], authParams, async (res: any) => {
        const data = {
          shop_type: authParams.shop_type,
          shop_user: '',
          shop_pwd: '',
          cookies: res.cookies
        }
        const res1: any = await addShop(data)
        if (res1 && res1.code === 200) {
          gp.$baseMessage('店铺修复成功!', 'success', 'hey')
          // 刷新授权异常列表（当前页）
          await getAuthErrorShops(authErrorPage.value)
          // 刷新综合统计数据（授权异常 + 功能到期）
          await getComprehensiveStats()
          // 刷新主列表
          await getShopList(queryParams, false)
        }
      })
    }
  } catch (error) {
    console.error('修复授权失败:', error)
    gp.$baseMessage('修复授权失败', 'error', 'hey')
  } finally {
    fixingAuthIds.value = fixingAuthIds.value.filter(id => id !== shop.id)
  }
}

// 监听功能代码变化，同步更新功能名称
watch(selectedFunctionCode, (newCode) => {
  const selectedOption = functionOptions.value.find(item => item.code === newCode)
  if (selectedOption) {
    selectedFunctionName.value = selectedOption.name
  }
})

// 处理保存滚动位置事件
const handleSaveScroll = (scrollPosition: number) => {
  const state = getShopTypeState(currentShopType.value)
  state.scrollPosition = scrollPosition
}

// 创建分组相关
const addGroupState = ref(false)
const btnLoading = ref(false)
const groupFormRef = ref()
const groupForm = reactive({
  id: '',
  type: 1,
  name: '',
  parentName: ''
})
const groupRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
}
const currentGroupDetail = ref<any>({})

// 创建分组
const createGroup = (item?: any) => {
  if (item && item.Member) {
    currentGroupDetail.value = item
    groupForm.parentName = item.Member.name
  } else {
    currentGroupDetail.value = {}
    groupForm.parentName = ''
  }
  groupForm.id = ''
  groupForm.name = ''
  addGroupState.value = true
}

// 确认创建/编辑分组
const confirmGroup = () => {
  if (groupFormRef.value) {
    groupFormRef.value.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        try {
          let res: any
          if (groupForm.id) {
            // 编辑分组
            res = await updateGroup({
              id: groupForm.id,
              name: groupForm.name,
              notes: '',
              type: groupForm.type,
            })
          } else {
            // 创建分组
            res = await addGroup({
              Parent: currentGroupDetail.value ? currentGroupDetail.value.Member?.id : null,
              name: groupForm.name,
              notes: '',
              type: groupForm.type,
            })
          }
          if (res && res.code === 200) {
            gp.$baseMessage(groupForm.id ? '编辑成功！' : '创建成功！', 'success', 'hey')
            closeGroup()
            // 如果分组管理弹窗打开，刷新列表
            if (groupManagementState.value) {
              await loadGroupManagementList()
            }
            // 刷新分组列表
            if (shopTableRef.value && shopTableRef.value.getGroupList) {
              shopTableRef.value.getGroupList()
            }
            // 刷新店铺列表，以便更新分组选项
            getShopList(queryParams)
          } else {
            gp.$baseMessage(res?.msg || (groupForm.id ? '编辑失败' : '创建失败'), 'error', 'hey')
          }
        } catch (error) {
          console.error('操作失败:', error)
          gp.$baseMessage(groupForm.id ? '编辑失败' : '创建失败', 'error', 'hey')
        } finally {
          btnLoading.value = false
        }
      }
    })
  }
}

// 关闭创建分组对话框
const closeGroup = () => {
  groupForm.id = ''
  groupForm.type = 1
  groupForm.name = ''
  groupForm.parentName = ''
  currentGroupDetail.value = {}
  addGroupState.value = false
}

// 分组管理相关
const groupManagementState = ref(false)
const groupManagementList = ref<any[]>([])

// 打开分组管理弹窗
const openGroupManagement = async () => {
  groupManagementState.value = true
  await loadGroupManagementList()
}

// 关闭分组管理弹窗
const closeGroupManagement = () => {
  groupManagementState.value = false
}

// 加载分组管理列表
const loadGroupManagementList = async () => {
  try {
    const res: any = await getGroup({
      grouptype: 1,
      recursionchild: true
    })
    if (res.code === 200) {
      // 扁平化分组数据
      const flattenGroups = (groups: any[]): any[] => {
        const result: any[] = []
        groups.forEach((group: any) => {
          const groupId = group.Member?.id || group.id
          const groupName = group.Member?.name || group.name
          if (groupId && groupName) {
            result.push({
              id: groupId,
              name: groupName,
              shopCount: 0, // 初始化为0，稍后获取
              raw: group
            })
          }
          if (group.children && group.children.length > 0) {
            result.push(...flattenGroups(group.children))
          }
        })
        return result
      }
      const flatList = flattenGroups(res.data)

      // 获取每个分组的门店数量
      const promises = flatList.map(async (item) => {
        try {
          const shopRes: any = await getBindShopList({
            groupid: item.id
          })
          if (shopRes.code === 200) {
            item.shopCount = shopRes.data?.total || shopRes.data?.rows?.length || 0
          }
        } catch (error) {
          console.error(`获取分组 ${item.name} 的门店数量失败:`, error)
          item.shopCount = 0
        }
        return item
      })

      groupManagementList.value = await Promise.all(promises)
    }
  } catch (error) {
    console.error('获取分组列表失败:', error)
    gp.$baseMessage('获取分组列表失败', 'error', 'hey')
  }
}

// 打开添加分组对话框
const openAddGroupDialog = () => {
  groupForm.id = ''
  groupForm.type = 1
  groupForm.name = ''
  groupForm.parentName = ''
  currentGroupDetail.value = {}
  addGroupState.value = true
}

// 编辑分组
const editGroupItem = (row: any) => {
  groupForm.id = row.id
  groupForm.name = row.name
  groupForm.type = 1
  groupForm.parentName = ''
  currentGroupDetail.value = row.raw || {}
  addGroupState.value = true
}

// 删除分组
const deleteGroupItem = (row: any) => {
  ElMessageBox.confirm('确定要删除该分组吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res: any = await delGroup(row.id)
      if (res && res.code === 200) {
        gp.$baseMessage('删除成功！', 'success', 'hey')
        await loadGroupManagementList()
        // 刷新分组列表
        if (shopTableRef.value && shopTableRef.value.getGroupList) {
          shopTableRef.value.getGroupList()
        }
        // 刷新店铺列表
        getShopList(queryParams)
      } else {
        gp.$baseMessage(res?.msg || '删除失败', 'error', 'hey')
      }
    } catch (error) {
      console.error('删除分组失败:', error)
      gp.$baseMessage('删除失败', 'error', 'hey')
    }
  }).catch(() => { })
}

// 查看分组店铺相关
const viewGroupShopsDialogVisible = ref(false)
const currentViewGroup = ref<any>(null)
const groupShopList = ref<any[]>([])
const groupShopLoading = ref(false)
const selectedGroupShops = ref<any[]>([])

// 查看分组店铺
const viewGroupShops = async (row: any) => {
  // 确保分组信息正确设置
  currentViewGroup.value = {
    id: row.id,
    name: row.name
  }
  selectedGroupShops.value = []
  await loadGroupShopList(row.id)
  viewGroupShopsDialogVisible.value = true
}

// 加载分组店铺列表
const loadGroupShopList = async (groupId: number) => {
  try {
    groupShopLoading.value = true
    const currentGroupName = currentViewGroup.value?.name || '当前分组'

    const res: any = await getBindShopList({
      groupid: groupId,
      page: 1,
      pageSize: 10000 // 获取所有店铺
    })

    if (res.code === 200 && res.data) {
      // 处理不同的数据结构
      let shops: any[] = []
      if (res.data.rows && Array.isArray(res.data.rows)) {
        shops = res.data.rows
      } else if (Array.isArray(res.data)) {
        shops = res.data
      } else if (res.data.data && Array.isArray(res.data.data)) {
        shops = res.data.data
      }

      // 为每个店铺添加当前分组名称
      groupShopList.value = shops.map((shop: any) => ({
        ...shop,
        group_name: currentGroupName
      }))
    } else {
      gp.$baseMessage(res?.msg || '获取店铺列表失败', 'error', 'hey')
      groupShopList.value = []
    }
  } catch (error) {
    console.error('获取分组店铺列表失败:', error)
    gp.$baseMessage('获取店铺列表失败', 'error', 'hey')
    groupShopList.value = []
  } finally {
    groupShopLoading.value = false
  }
}

// 关闭查看分组店铺对话框
const closeViewGroupShopsDialog = () => {
  viewGroupShopsDialogVisible.value = false
  currentViewGroup.value = null
  groupShopList.value = []
  selectedGroupShops.value = []
}

// 处理分组店铺选择变化
const handleGroupShopSelectionChange = (shops: any[]) => {
  selectedGroupShops.value = shops
}

// 修改店铺分组相关
const changeShopGroupDialogVisible = ref(false)
const changeGroupLoading = ref(false)
const targetGroupId = ref<number | undefined>(undefined)
const currentChangeShop = ref<any>(null)
const allGroupOptions = ref<any[]>([])

// 修改单个店铺分组
const changeShopGroup = async (row: any) => {
  currentChangeShop.value = row
  targetGroupId.value = undefined
  // 加载所有分组选项
  await loadAllGroupOptions()
  changeShopGroupDialogVisible.value = true
}

// 加载所有分组选项
const loadAllGroupOptions = async () => {
  try {
    const res: any = await getGroup({
      grouptype: 1,
      recursionchild: true
    })
    if (res.code === 200) {
      const flattenGroups = (groups: any[], prefix = ''): any[] => {
        const result: any[] = []
        groups.forEach((group) => {
          const groupId = group.Member?.id || group.id
          const groupName = group.Member?.name || group.name
          const fullName = prefix ? `${prefix} / ${groupName}` : groupName
          result.push({
            value: groupId,
            label: fullName
          })
          if (group.children && group.children.length > 0) {
            result.push(...flattenGroups(group.children, fullName))
          }
        })
        return result
      }
      allGroupOptions.value = flattenGroups(res.data)
    }
  } catch (error) {
    console.error('获取分组选项失败:', error)
  }
}

// 确认修改店铺分组（支持单个和批量）
const confirmChangeShopGroup = async () => {
  const isBatch = !currentChangeShop.value && selectedGroupShops.value.length > 0
  const shops = isBatch ? selectedGroupShops.value : (currentChangeShop.value ? [currentChangeShop.value] : [])

  if (shops.length === 0) {
    gp.$baseMessage('请选择要修改的店铺', 'warning', 'hey')
    return
  }

  try {
    changeGroupLoading.value = true
    const shopIds = shops.map((shop: any) => shop.id)
    const shopOfficeIds = shops.map((shop: any) => shop.office_id)

    // 如果当前有分组，先从旧分组移除
    if (currentViewGroup.value) {
      const removeRes: any = await connectShopUserRemoveGroup({
        groupId: currentViewGroup.value.id,
        shopIds,
        shopOfficeIds
      })
      if (removeRes.code !== 200) {
        gp.$baseMessage('从旧分组移除失败', 'error', 'hey')
        return
      }
    }

    // 如果选择了新分组，添加到新分组
    if (targetGroupId.value) {
      const addRes: any = await connectShopUserGroup({
        groupId: targetGroupId.value,
        shopIds,
        shopOfficeIds
      })
      if (addRes.code !== 200) {
        gp.$baseMessage('添加到新分组失败', 'error', 'hey')
        return
      }
    }

    gp.$baseMessage(isBatch ? '批量修改分组成功' : '修改分组成功', 'success', 'hey')
    closeChangeShopGroupDialog()
    if (isBatch) {
      selectedGroupShops.value = []
    }
    // 刷新分组店铺列表
    if (currentViewGroup.value) {
      await loadGroupShopList(currentViewGroup.value.id)
    }
    // 刷新分组管理列表
    await loadGroupManagementList()
    // 刷新主店铺列表
    getShopList(queryParams, false)
    // 刷新分组选项
    if (shopTableRef.value && shopTableRef.value.getGroupList) {
      shopTableRef.value.getGroupList()
    }
  } catch (error) {
    console.error('修改分组失败:', error)
    gp.$baseMessage('修改分组失败', 'error', 'hey')
  } finally {
    changeGroupLoading.value = false
  }
}

// 关闭修改分组对话框
const closeChangeShopGroupDialog = () => {
  changeShopGroupDialogVisible.value = false
  currentChangeShop.value = null
  targetGroupId.value = undefined
}

// 从分组移除单个店铺
const removeShopFromGroup = async (row: any) => {
  ElMessageBox.confirm(`确定要将"${row.name}"从当前分组移除吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      if (!currentViewGroup.value) return

      const shopIds = [row.id]
      const shopOfficeIds = [row.office_id]

      const removeRes: any = await connectShopUserRemoveGroup({
        groupId: currentViewGroup.value.id,
        shopIds,
        shopOfficeIds
      })

      if (removeRes.code === 200) {
        gp.$baseMessage('移除成功', 'success', 'hey')
        // 刷新分组店铺列表
        await loadGroupShopList(currentViewGroup.value.id)
        // 刷新分组管理列表
        await loadGroupManagementList()
        // 刷新主店铺列表
        getShopList(queryParams, false)
        // 刷新分组选项
        if (shopTableRef.value && shopTableRef.value.getGroupList) {
          shopTableRef.value.getGroupList()
        }
      } else {
        gp.$baseMessage(removeRes?.msg || '移除失败', 'error', 'hey')
      }
    } catch (error) {
      console.error('移除店铺失败:', error)
      gp.$baseMessage('移除失败', 'error', 'hey')
    }
  }).catch(() => { })
}

// 批量修改店铺分组
const batchChangeShopGroup = async () => {
  if (selectedGroupShops.value.length === 0) {
    gp.$baseMessage('请选择要修改的店铺', 'warning', 'hey')
    return
  }
  currentChangeShop.value = null // 标记为批量操作
  targetGroupId.value = undefined
  await loadAllGroupOptions()
  changeShopGroupDialogVisible.value = true
}

// 批量从分组移除店铺
const batchRemoveShopFromGroup = async () => {
  if (selectedGroupShops.value.length === 0) {
    gp.$baseMessage('请选择要移除的店铺', 'warning', 'hey')
    return
  }

  ElMessageBox.confirm(`确定要将选中的 ${selectedGroupShops.value.length} 家店铺从当前分组移除吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      if (!currentViewGroup.value) return

      const shopIds = selectedGroupShops.value.map((shop: any) => shop.id)
      const shopOfficeIds = selectedGroupShops.value.map((shop: any) => shop.office_id)

      const removeRes: any = await connectShopUserRemoveGroup({
        groupId: currentViewGroup.value.id,
        shopIds,
        shopOfficeIds
      })

      if (removeRes.code === 200) {
        gp.$baseMessage('批量移除成功', 'success', 'hey')
        selectedGroupShops.value = []
        // 刷新分组店铺列表
        await loadGroupShopList(currentViewGroup.value.id)
        // 刷新分组管理列表
        await loadGroupManagementList()
        // 刷新主店铺列表
        getShopList(queryParams, false)
        // 刷新分组选项
        if (shopTableRef.value && shopTableRef.value.getGroupList) {
          shopTableRef.value.getGroupList()
        }
      } else {
        gp.$baseMessage(removeRes?.msg || '批量移除失败', 'error', 'hey')
      }
    } catch (error) {
      console.error('批量移除店铺失败:', error)
      gp.$baseMessage('批量移除失败', 'error', 'hey')
    }
  }).catch(() => { })
}

// 标记是否已经初始化过数据（按店铺类型）
const initializedShopTypes = ref<Set<ShopType>>(new Set())

// 监听手动授权添加店铺成功事件
let shopAddedHandler: ((data: any) => void) | null = null

/**
 * 重置所有筛选和搜索条件到初始状态
 */
const resetAllFilters = () => {
  // 立即设置重置标志
  setIsResetting(true)

  // ⚠️ 强制重置 isFetching 标志，确保可以发起新请求
  isFetching = false

  // 重置筛选条件
  queryParams.filter = {
    time_state: undefined,
    shopType: currentShopType.value,
    word: undefined,
    group: undefined,
    state: undefined,
    ck_online: undefined,
    citys: undefined,
    func_code: undefined,
    func_state: undefined,
    avtag: undefined
  }
  // 重置排序
  queryParams.order_by = undefined
  queryParams.order_direction = undefined
  // 重置分页
  queryParams.page = 1
  queryParams.pageSize = 20

  // 清除保存的状态
  const state = getShopTypeState(currentShopType.value)
  state.page = 1
  state.pageSize = 20
  state.filter = { ...queryParams.filter }
  state.order_by = undefined
  state.order_direction = undefined
  state.scrollPosition = 0

  // 清空当前店铺列表
  shopList.value = []

  // 立即刷新列表
  getShopList(queryParams)

  // 通知 ShopTable 组件重置筛选状态
  if (shopTableRef.value && shopTableRef.value.resetFilterStates) {
    nextTick(() => {
      shopTableRef.value.resetFilterStates()
    })
  }

  // 延迟清除重置标志
  setTimeout(() => {
    setIsResetting(false)
  }, 2000)
}

// 刷新事件处理函数
let refreshHandler: (() => void) | null = null
// 标志：是否正在执行重置操作（使用 sessionStorage 持久化，防止页面刷新后丢失）
const getIsResetting = () => {
  return sessionStorage.getItem('shop-list-resetting') === 'true'
}
const setIsResetting = (value: boolean) => {
  if (value) {
    sessionStorage.setItem('shop-list-resetting', 'true')
  } else {
    sessionStorage.removeItem('shop-list-resetting')
  }
}

// 在组件挂载之前订阅刷新事件，确保在组件重新激活之前就能设置重置标志
onBeforeMount(() => {
  const gp = (globalThis as any).$baseSub
  if (gp) {
    // 订阅刷新事件，重置筛选和搜索条件
    // 必须在 onBeforeMount 中订阅，确保在组件重新激活之前就能执行重置
    refreshHandler = (refreshRouteName?: any) => {
      const route = useRoute()
      // 只有在当前路由时才重置
      if (!refreshRouteName || refreshRouteName === route.name || route.name === 'ShopV2Index' || route.name === 'ShopV2Functional' || route.name === 'ShopV2Operation') {
        // 立即设置重置标志，必须在任何其他操作之前
        setIsResetting(true)
        // 使用 nextTick 确保在组件重新激活之前执行重置
        nextTick(() => {
          resetAllFilters()
        })
      }
    }
    gp('reload-router-view', refreshHandler)
  }
})

// 初始化时加载数据（仅首次挂载时执行）
onMounted(() => {
  // 从 sessionStorage 恢复店铺类型
  const savedShopType = getSavedShopType()
  if (savedShopType !== currentShopType.value) {
    currentShopType.value = savedShopType
  }

  // 如果正在重置，不恢复状态
  if (getIsResetting()) {
    // 清除重置标志（首次挂载时不应该有重置标志，如果有说明是异常情况）
    setIsResetting(false)
    // 使用重置后的状态加载数据
    if (!initializedShopTypes.value.has(currentShopType.value)) {
      getShopList(queryParams)
      initializedShopTypes.value.add(currentShopType.value)
    }
  } else {
    // 恢复当前店铺类型的状态
    restoreShopTypeState(currentShopType.value)

    if (!initializedShopTypes.value.has(currentShopType.value)) {
      getShopList(queryParams)
      initializedShopTypes.value.add(currentShopType.value)
    }
  }

  // 基础版：初始化统计数据（即将到期和授权异常）
  initStatusCount()

  // 订阅手动授权添加店铺成功事件
  const gp = (globalThis as any).$baseSub
  if (gp) {
    shopAddedHandler = (data: any) => {
      handleShopAdded(data)
    }
    gp('shop-added-from-auth', shopAddedHandler)
  }
})

onBeforeUnmount(() => {
  // 取消订阅
  const gp = (globalThis as any).$baseSub
  if (gp) {
    if (shopAddedHandler) {
      gp('shop-added-from-auth', shopAddedHandler)
    }
    if (refreshHandler) {
      gp('reload-router-view', refreshHandler)
    }
  }
})

// 组件激活时，如果该店铺类型还未初始化则加载数据，否则不刷新
onActivated(() => {
  const isResetting = getIsResetting()

  // 如果正在执行重置操作，跳过状态恢复，但确保数据已加载
  if (isResetting) {
    // 确保数据已加载（重置函数中已经调用了 getShopList，这里只是作为保险）
    if (!initializedShopTypes.value.has(currentShopType.value)) {
      getShopList(queryParams)
      initializedShopTypes.value.add(currentShopType.value)
    }
    // 保险机制：如果标志存在超过3秒，强制清除（防止标志卡住）
    setTimeout(() => {
      if (getIsResetting()) {
        setIsResetting(false)
      }
    }, 3000)
    return
  }

  // 从 sessionStorage 恢复店铺类型
  const savedShopType = getSavedShopType()
  if (savedShopType !== currentShopType.value) {
    currentShopType.value = savedShopType
    // 恢复新店铺类型的状态
    restoreShopTypeState(currentShopType.value)
  } else {
    // 恢复当前店铺类型的状态
    restoreShopTypeState(currentShopType.value)
  }

  // 如果该店铺类型还未初始化，则加载数据
  if (!initializedShopTypes.value.has(currentShopType.value)) {
    getShopList(queryParams)
    initializedShopTypes.value.add(currentShopType.value)
  }
  // 如果已初始化，则不刷新数据，保持之前的状态
})
</script>
<style scoped lang="scss">
.page-container {
  padding: 20px;
  padding-left: 60px; // 为左侧复选框留出空间
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  overflow: visible !important; // 改为 visible 以显示复选框
  position: relative !important;
}

.screen-container {
  flex-shrink: 0;
}

.shop-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible; // 改为 visible 以显示左侧复选框
  min-height: 0;
  margin-left: -40px; // 向左偏移，让表格回到原位置
  padding-left: 40px; // 补偿偏移，为复选框留空间
}

// 分组管理弹窗样式
:deep(.group-management-dialog) {
  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.group-management-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.group-management-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.group-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;

  .group-list-title {
    font-weight: bold;
    font-size: 14px;
  }
}

.group-table-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;

  :deep(.el-table) {
    .el-table__body-wrapper {
      max-height: calc(70vh - 180px);
      overflow-y: auto;
    }
  }
}

.shop-type-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  align-content: flex-start;
  gap: 12px;
  row-gap: 10px;
  padding: 0;
  margin-bottom: 12px;
  margin-top: -12px;
  position: relative;

  .shop-type-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: center;
    gap: 0;
    row-gap: 4px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .shop-type-search {
    display: flex;
    align-items: center;
  }

  :deep(.el-dropdown) {
    display: inline-block;
  }

  .shop-type-item {
    height: 35px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
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
  :deep(.el-dropdown) {
    .shop-type-item {
      cursor: pointer;
    }
  }
}

:deep() {
  .el-divider--horizontal {
    margin: 12px 0;
  }
}

.version-actions-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  row-gap: 12px;
  margin-bottom: 4px;

  .version-buttons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .version-button {
      min-width: 80px;
      border-radius: 0;
      margin-left: 0;
      position: relative;

      &:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      &:last-of-type {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        margin-right: 0;
      }

      &:not(:last-of-type) {
        border-right: none;
      }

      &:not(:first-child) {
        margin-left: -1px;
      }
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;

      .add-shop-btn {
        background-color: #67c23a !important;
        border-color: #67c23a !important;

        &:hover {
          background-color: #85ce61 !important;
          border-color: #85ce61 !important;
        }

        &:focus {
          background-color: #67c23a !important;
          border-color: #67c23a !important;
        }
      }
    }
  }

  .recycle-btn {
    margin-left: auto;
  }

  // 查看分组店铺对话框样式
  .view-group-shops-dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 500px;
    max-height: 70vh;

    .dialog-header-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 4px;
      font-size: 14px;
      color: #606266;
      flex-shrink: 0;
    }

    .table-wrapper {
      flex: 1;
      overflow: hidden;
      min-height: 0;

      :deep(.el-table) {
        height: 100%;

        .el-table__body-wrapper {
          max-height: 400px;
          overflow-y: auto;
        }
      }
    }

    .dialog-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e4e7ed;
      flex-shrink: 0;
    }
  }

  // 修改店铺分组对话框样式
  .change-shop-group-dialog {
    padding: 0 4px;
  }
}

// 全局对话框样式调整（确保翻页组件完整显示）
:deep(.el-dialog) {
  .el-dialog__body {
    padding-bottom: 0px !important; // 大幅增加底部空间
    overflow-y: auto !important; // 允许垂直滚动
    max-height: calc(80vh - 100px) !important; // 限制最大高度，留出底部空间
  }

  .el-dialog__footer {
    padding-top: 20px !important;
  }
}

// 针对即将到期和授权异常对话框的特殊处理
:deep(.el-dialog__wrapper) {
  .el-dialog {
    margin-bottom: 80px !important; // 确保对话框底部有足够空间
  }
}

// 基础版：状态卡片样式（与运营版一致）
.operate-status-card {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .status-entry {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 5px 12px; // 调整内边距，使总高度与按钮一致（约32px）
    height: 32px; // 固定高度，与批量续费按钮一致
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
    box-sizing: border-box; // 确保 padding 包含在 height 内

    &.warning {
      background-color: #fff7e6;
      border: 1px solid #ffd591;

      &:hover {
        background-color: #ffe7ba;
      }
    }

    &.danger {
      background-color: #fff2f0;
      border: 1px solid #ffccc7;

      &:hover {
        background-color: #ffe4e1;
      }
    }

    .status-label {
      color: #666;
      white-space: nowrap;
    }

    .status-number {
      font-size: 18px;
      font-weight: bold;
      margin: 0 4px;

      &.blur-text {
        filter: blur(4px) !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
    }

    &.warning .status-number {
      color: #fa8c16;
    }

    &.danger .status-number {
      color: #ff4d4f;
    }

    .status-unit {
      color: #999;
    }

    .batch-renew-btn,
    .confirm-renew-btn {
      flex-shrink: 0;
    }
  }
}

// 即将到期对话框样式
.expiring-shop-dialog {
  padding-bottom: 20px; // 确保底部有足够空间显示翻页组件

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .expired-text {
    color: #ff4d4f;
    font-weight: 500;
  }

  // 确保翻页组件完整显示
  .vab-pagination {
    margin-top: 16px;
    padding-top: 8px;
  }
}

// 授权异常对话框样式
.auth-error-shop-dialog {
  padding-bottom: 20px; // 确保底部有足够空间显示翻页组件

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;
  }

  // 确保翻页组件完整显示
  .vab-pagination {
    margin-top: 16px;
    padding-top: 8px;
  }
}

// 演示模式模糊效果
.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

// 确保弹窗中的模糊效果也能应用
:deep(.el-dialog) {
  .blur-text {
    filter: blur(4px) !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
}

// 确保表格中的模糊效果也能应用
:deep(.el-table) {
  .blur-text {
    filter: blur(4px) !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
}
</style>