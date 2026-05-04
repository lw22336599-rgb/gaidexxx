<template>
  <div class="page-container">
    <div class="screen-container">
      <!-- 店铺类型导航栏 -->
      <div class="shop-type-nav">
        <div class="shop-type-list">
          <div
            v-for="option in shopTypeOptions"
            :key="option.value"
            class="shop-type-item"
            :class="{ active: currentShopType === option.value }"
            @click.stop="handleShopTypeChange(option.value)"
          >
            <PlatformIcon :shop-type="option.value" :size="20" />
            <span class="shop-type-label">{{ option.label }}</span>
          </div>
        </div>
        <!-- 搜索框 -->
        <div class="shop-type-search">
          <el-input
            v-model="queryParams.filter.word"
            clearable
            placeholder="搜索门店名称或ID或备注"
            style="width: 220px"
            @change="handleSearch"
          />
        </div>
      </div>

      <!-- 版本选择和操作按钮 -->
      <div class="version-actions-bar">
        <div class="version-buttons">
          <el-button
            :type="versionType === '功能版' ? 'primary' : 'default'"
            class="version-button"
            @click="switchToFunctional"
          >
            功能版
          </el-button>
          <el-button :type="'primary'" class="version-button"> 运营版 </el-button>
          <div class="action-buttons">
            <AuthButton
              :shop-type="currentShopType"
              @refresh="handleRefresh"
              @shop-added="handleShopAdded"
              @bind="bindShopCode()"
            />
            <el-button type="primary" @click="openGroupManagement">
              <el-icon style="margin-right: 4px">
                <Folder />
              </el-icon>
              分组管理
            </el-button>
          </div>
        </div>
        <!-- 运营版功能状态卡片（移到回收站左边） -->
        <div class="operate-status-card">
          <div class="status-entry warning" @click="openExpiringDialog">
            <span class="status-label">运营版即将到期：</span>
            <span class="status-number" :class="{ 'blur-text': demoMode }">{{ expiringShopCount }}</span>
            <span class="status-unit">家店铺</span>
            <el-button
              :type="batchRenewMode ? 'warning' : 'primary'"
              size="small"
              class="batch-renew-btn"
              @click.stop="toggleBatchRenewMode"
            >
              <el-icon style="margin-right: 4px">
                <Tickets />
              </el-icon>
              {{ batchRenewMode ? '取消批量续费' : '批量续费' }}
            </el-button>
            <el-button
              v-if="batchRenewMode && selectedShopsForRenew.length > 0"
              type="primary"
              size="small"
              class="confirm-renew-btn"
              @click.stop="handleConfirmRenew"
            >
              <el-icon style="margin-right: 4px">
                <Check />
              </el-icon>
              确认续费
            </el-button>
          </div>
          <div class="status-entry danger" @click="openAuthErrorDialog">
            <span class="status-label">运营版授权异常：</span>
            <span class="status-number" :class="{ 'blur-text': demoMode }">{{ authErrorShopCount }}</span>
            <span class="status-unit">家店铺</span>
          </div>
        </div>
        <el-button :icon="Delete" type="danger" class="recycle-btn" @click="openRecycle">回收站</el-button>
      </div>
    </div>
    <div class="shop-table-wrapper">
      <shop-table
        ref="shopTableRef"
        :list-loading="tableLoading"
        :page="queryParams.page"
        :page-size="queryParams.pageSize"
        :shop-list="shopList"
        :shop-type="currentShopType"
        :shop-type-str="getShopTypeStr(currentShopType)"
        :total="total"
        :batch-renew-mode="batchRenewMode"
        @update-page="updatePage"
        @update-filter="handleFilterChange"
        @save-scroll="handleSaveScroll"
        @sort-change="handleTableSort"
        @shop-selection-change="handleShopSelectionChange"
      />
    </div>
    <!-- 回收站 -->
    <recycle
      v-if="recycleState"
      :recycle-state="recycleState"
      :shop-type="currentShopType"
      :shop-type-str="getShopTypeStr(currentShopType)"
      @close-recycle="closeRecycle"
      @shop-recovered="handleShopRecovered"
    />
    <!-- 添加店铺相关 -->
    <set-only-bind
      v-if="showShopMsgState"
      :add-shop-after-obj="showShopMsg"
      :add-shop-after-state="showShopMsgState"
      :is-bind="isBind"
      @close-shop-after="closeShopAfter"
    />
    <!-- 分组管理对话框 -->
    <el-dialog
      v-model="groupManagementState"
      :before-close="closeGroupManagement"
      :destroy-on-close="true"
      width="800px"
      class="group-management-dialog"
    >
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
    <el-dialog
      v-model="addGroupState"
      :before-close="closeGroup"
      :destroy-on-close="true"
      :title="groupForm.id ? '编辑分组' : '添加分组'"
      width="500px"
    >
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
    <BatchRenewDialog
      v-model="batchRenewDialogVisible"
      :shop-list="selectedShopsForRenew"
      :shop-type="currentShopType"
      :function-code="selectedFunctionCode"
      :function-name="selectedFunctionName"
      @renew-success="handleRenewSuccess"
    />
    <!-- 查看分组店铺对话框 -->
    <el-dialog
      v-model="viewGroupShopsDialogVisible"
      :title="`查看分组：${currentViewGroup?.name || ''}`"
      width="900px"
      :before-close="closeViewGroupShopsDialog"
      destroy-on-close
    >
      <div class="view-group-shops-dialog">
        <div class="dialog-header-info">
          <span>共 {{ groupShopList.length }} 家店铺</span>
        </div>
        <div class="table-wrapper">
          <el-table
            v-loading="groupShopLoading"
            :data="groupShopList"
            border
            height="400"
            @selection-change="handleGroupShopSelectionChange"
          >
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
        <div v-if="selectedGroupShops.length > 0" class="dialog-footer-actions">
          <el-button type="primary" @click="batchChangeShopGroup"
            >批量修改分组 ({{ selectedGroupShops.length }})</el-button
          >
          <el-button type="danger" @click="batchRemoveShopFromGroup"
            >批量移除 ({{ selectedGroupShops.length }})</el-button
          >
        </div>
      </div>
    </el-dialog>
    <!-- 修改店铺分组对话框 -->
    <el-dialog
      v-model="changeShopGroupDialogVisible"
      title="修改分组"
      width="500px"
      :before-close="closeChangeShopGroupDialog"
      destroy-on-close
    >
      <div class="change-shop-group-dialog">
        <el-form label-width="100px">
          <el-form-item label="选择分组">
            <el-select v-model="targetGroupId" placeholder="请选择分组" style="width: 100%" clearable>
              <el-option label="未分组" :value="0" />
              <el-option
                v-for="group in allGroupOptions"
                :key="group.value"
                :label="group.label"
                :value="group.value"
              />
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
    <!-- 即将到期店铺对话框（参考基础版实现） -->
    <el-dialog
      v-model="expiringDialogVisible"
      title="运营版即将到期店铺"
      width="1000px"
      :before-close="closeExpiringDialog"
      destroy-on-close
    >
      <div class="expiring-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ expiringTotal }} 家店铺即将到期（7天内）</span>
          <el-button type="primary" :disabled="selectedExpiringShops.length === 0" @click="batchRenewExpiringShops">
            批量续费 ({{ selectedExpiringShops.length }})
          </el-button>
        </div>
        <el-table
          v-loading="expiringLoading"
          :data="expiringShopList"
          border
          max-height="500px"
          @selection-change="handleExpiringSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="150">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span>
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
        <vab-pagination
          :current-page="expiringPage"
          :page-size="expiringPageSize"
          :total="expiringTotal"
          style="margin-top: 16px"
          @current-change="handleExpiringPageChange"
          @size-change="handleExpiringSizeChange"
        />
      </div>
    </el-dialog>
    <!-- 授权异常店铺对话框（参考基础版实现） -->
    <el-dialog
      v-model="authErrorDialogVisible"
      title="运营版授权异常店铺"
      width="900px"
      :before-close="closeAuthErrorDialog"
      destroy-on-close
    >
      <div class="auth-error-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ authErrorTotal }} 家店铺授权异常</span>
        </div>
        <el-table v-loading="authErrorLoading" :data="authErrorShopList" border max-height="500px">
          <el-table-column label="店铺名称" prop="name" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="门店ID" prop="office_id" width="150">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.office_id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上次授权时间" prop="ck_uptime" width="180" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button type="danger" size="small" :loading="fixingAuthIds.includes(row.id)" @click="fixAuth(row)"
                >修复</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <vab-pagination
          :current-page="authErrorPage"
          :page-size="authErrorPageSize"
          :total="authErrorTotal"
          style="margin-top: 16px"
          @current-change="handleAuthErrorPageChange"
          @size-change="handleAuthErrorSizeChange"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { bindShop, addShop, getGroup } from '/@/api/shop.ts'
import { addGroup, updateGroup, delGroup } from '/@/api/group.ts'
import { getBindShopList, connectShopUserGroup, connectShopUserRemoveGroup } from '/@/api/group.ts'
import ShopTable from '/@/views/shop/componentsV2/ShopTableOperate.vue'
import { useRoute, useRouter } from 'vue-router'
import { watch, nextTick, computed, ref, reactive, onMounted, onActivated, onBeforeMount, onBeforeUnmount } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { Key, Delete, Plus, Tickets, Check, Folder } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { gp } from '/@vab/plugins/vab'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { openShopWindow } from '/@/utils/openShopWin'
import recycle from '/@/views/shop/componentsV2/Recycle.vue'
import BatchRenewDialog from '/@/views/shop/componentsV2/BatchRenewDialog.vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { getRenewFunctionList } from '/@/utils/functionCache.ts'
import { OrderDirection } from '/@/TsModel/Alien/Controllers/Shop/OrderDirection'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

// 确保 vab-icon 可用（全局组件）

const route = useRoute()
const router = useRouter()

// 检查是否在Electron环境中
const isElectron = !!(globalThis as any).electron

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 店铺类型选项（按照门店管理的顺序）
const shopTypeOptions = [
  { label: '美团餐饮', value: ShopType.美团 },
  { label: '美团闪购', value: ShopType.美团闪购 },
  { label: '美团医药', value: ShopType.美团医药 },
  { label: '饿了么餐饮', value: ShopType.饿了么 },
  { label: '饿百零售', value: ShopType.饿百零售 },
  { label: '京东到家', value: ShopType.京东到家 }
]

/**
 * 从 sessionStorage 恢复保存的店铺类型
 * @returns 保存的店铺类型，如果没有则返回默认值（美团）
 */
const getSavedShopType = (): ShopType => {
  try {
    const saved = sessionStorage.getItem('mtFeatureV2Operation_currentShopType')
    if (saved) {
      const shopType = parseInt(saved, 10) as ShopType
      if (shopTypeOptions.some(opt => opt.value === shopType)) {
        return shopType
      }
    }

    // 兼容：首次从基础版/功能版跳转到运营版时，优先读取基础版的保存值
    const savedFromBase = sessionStorage.getItem('mtFeatureV2_currentShopType')
    if (savedFromBase) {
      const shopType = parseInt(savedFromBase, 10) as ShopType
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

/**
 * 保存当前选中的店铺类型到 sessionStorage
 */
const saveCurrentShopType = (shopType: ShopType) => {
  try {
    sessionStorage.setItem('mtFeatureV2Operation_currentShopType', shopType.toString())
  } catch (error) {
    console.error('保存店铺类型失败:', error)
  }
}

// 版本类型（基础版、功能版、运营版）
const versionType = ref('运营版')

// 切换到功能版
const switchToFunctional = () => {
  // 进入功能版前，同步当前店铺类型给功能版页面
  try {
    sessionStorage.setItem('mtFeatureV2_currentShopType', currentShopType.value.toString())
  } catch {}
  router.push('/shop-v2/functional')
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
    1001: 'jd-home-feature' // 京东团购使用京东到家的 typeStr
  }
  return typeMap[shopType] || 'mt-feature'
}

const tableLoading = ref(false)
const total = ref(0)
const shopList = ref<any[]>([])

// 运营版功能状态统计 - 使用独立接口获取，不受筛选影响
const expiringShopCount = ref(0)
const authErrorShopCount = ref(0)
const expiringShopList = ref<any[]>([])
const authErrorShopList = ref<any[]>([])
const expiringLoading = ref(false)
const authErrorLoading = ref(false)

// 运营版：分页状态
const expiringPage = ref(1)
const expiringPageSize = ref(10) // 改为每页10条
const expiringTotal = ref(0)
const authErrorPage = ref(1)
const authErrorPageSize = ref(10) // 改为每页10条
const authErrorTotal = ref(0)

// 防重复请求标志
let isFetchingExpiring = false
let isFetchingAuthError = false

// 获取即将到期的店铺列表（分页懒加载，每次10条）
const getExpiringShops = async (page: number = 1) => {
  // 防止重复请求
  if (isFetchingExpiring) {
    return
  }

  try {
    isFetchingExpiring = true
    expiringLoading.value = true

    const data: any = {
      page: page,
      pageSize: expiringPageSize.value,
      filter: {
        shopType: currentShopType.value,
        func_code: 'APPDATA', // 只筛选运营版
        func_state: 2 // 即将到期
        // 不设置其他筛选条件
      }
    }

    const res = await apiManager.shopmgApi.GetShopListV2(data)
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

// 获取即将到期店铺总数（用于卡片显示）
const getExpiringShopCount = async () => {
  try {
    // 🟢 使用专门的统计接口 GetFuncCountV2，只返回统计数据，不传输店铺数据
    const result = await apiManager.shopmgApi.GetFuncCountV2(
      currentShopType.value,
      'APPDATA' // 运营版数据功能
    )

    if (result && result['APPDATA']) {
      // almost_end 是即将到期的店铺数量
      expiringShopCount.value = result['APPDATA'].almost_end || 0
    } else {
      expiringShopCount.value = 0
    }
  } catch (error) {
    console.error('获取即将到期店铺总数失败:', error)
  }
}

// 获取授权异常的店铺列表（分页懒加载，每次10条）
const getAuthErrorShops = async (page: number = 1) => {
  // 防止重复请求
  if (isFetchingAuthError) {
    return
  }

  try {
    isFetchingAuthError = true
    authErrorLoading.value = true

    const data: any = {
      page: page,
      pageSize: authErrorPageSize.value,
      filter: {
        shopType: currentShopType.value,
        func_code: 'APPDATA', // 只筛选运营版
        func_state: 1, // 已开启的功能
        state: 3 // 授权异常
      }
    }

    const res = await apiManager.shopmgApi.GetShopListV2(data)
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

// 获取授权异常店铺总数（用于卡片显示）
const getAuthErrorShopCount = async () => {
  try {
    const data: any = {
      page: 1,
      pageSize: 1,
      filter: {
        shopType: currentShopType.value,
        func_code: 'APPDATA',
        func_state: 1,
        state: 3
      }
    }
    const res = await apiManager.shopmgApi.GetShopListV2(data)
    if (res) {
      authErrorShopCount.value = res.total || 0
    }
  } catch (error) {
    console.error('获取授权异常店铺总数失败:', error)
  }
}

// 初始化统计数据（只获取总数）
const initStatusCount = async () => {
  await Promise.all([getExpiringShopCount(), getAuthErrorShopCount()])
}

/**
 * 加载状态标志
 */
let isFetching = false // 防止重复加载店铺列表
let isChangingShopType = false // 是否在切换店铺类型
let latestRequestShopType: ShopType | undefined // 最新请求的店铺类型，用于竞态时只让最新请求清除 loading
let changingTimer: ReturnType<typeof setTimeout> | null = null // 切换延迟定时器（与功能版一致）
let isRefreshing = false // 是否正在刷新（防止 onActivated 误触发）

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

/**
 * 获取指定店铺类型的状态，如果不存在则创建默认状态
 */
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
        func_code: 'APPDATA', // 运营版默认筛选 APPDATA 功能
        func_state: 1, // 运营版默认筛选已开启的功能
        avtag: undefined
      },
      order_by: undefined,
      order_direction: undefined,
      scrollPosition: 0
    })
  }
  return shopTypeStates.value.get(shopType)!
}

/**
 * 保存当前店铺类型的状态到缓存
 */
const saveCurrentShopTypeState = () => {
  const state = getShopTypeState(currentShopType.value)
  state.page = queryParams.page
  state.pageSize = queryParams.pageSize
  state.filter = { ...queryParams.filter }
  state.order_by = queryParams.order_by
  state.order_direction = queryParams.order_direction
}

/**
 * 恢复指定店铺类型的状态
 * @returns 返回滚动位置
 */
const restoreShopTypeState = (shopType: ShopType): number => {
  const state = getShopTypeState(shopType)
  queryParams.page = state.page
  queryParams.pageSize = state.pageSize
  queryParams.filter = { ...state.filter, shopType }
  queryParams.order_by = state.order_by
  queryParams.order_direction = state.order_direction

  // 确保 currentShopType 同步更新
  if (currentShopType.value !== shopType) {
    currentShopType.value = shopType
    saveCurrentShopType(shopType)
  }

  return state.scrollPosition || 0
}

// 运营版
defineOptions({
  name: 'MtFeatureV2Operation'
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
    func_code: 'APPDATA', // 运营版默认筛选 APPDATA 功能
    func_state: 1, // 运营版默认筛选已开启的功能
    avtag: undefined
  },
  order_by: undefined,
  order_direction: undefined
})

/**
 * 处理表格排序变化（从表格列头点击触发）
 */
const handleTableSort = (sortInfo: { field: string; order: 'asc' | 'desc' | null }) => {
  // 更新排序参数
  if (sortInfo.field && sortInfo.order) {
    queryParams.order_by = sortInfo.field
    queryParams.order_direction = sortInfo.order === 'asc' ? OrderDirection.Asc : OrderDirection.Desc
  } else {
    queryParams.order_by = undefined
    queryParams.order_direction = undefined
  }

  queryParams.page = 1 // 排序时重置页码
  saveCurrentShopTypeState()
  getShopList(queryParams, true)
}

/** 将 func_info / func_enable 展平到 item：item[code]、item[code+'time']，支持后端动态功能 */
function updateFuncInfo(item: any, funcInfo: any): void {
  ;(funcInfo || []).forEach((func: any) => {
    if (!func?.code) return
    item[func.code] = func?.enable ?? false
    item[`${func.code}time`] = setTime(func?.end_time)
  })
}

const setTime = (date?: string | null): string => {
  if (date) {
    const dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      // 检查是否是一个有效的日期
      let y = dateObj.getFullYear()
      let m: string | number = dateObj.getMonth() + 1
      m = m < 10 ? `0${m}` : m.toString()
      let d: string | number = dateObj.getDate()
      d = d < 10 ? `0${d}` : d.toString()
      return `${y}-${m}-${d}`
    }
  }
  return '已到期'
}

const getShopList = async (data: any, keepOldData = false) => {
  // 如果正在加载中，直接返回，避免重复加载
  if (isFetching) {
    return
  }

  const requestedShopType = data.filter?.shopType as ShopType | undefined
  latestRequestShopType = requestedShopType
  isFetching = true

  // 如果不需要保持旧数据，立即显示 loading
  // 如果需要保持旧数据（切换店铺类型时），不显示 loading，保持旧数据可见
  if (!keepOldData) {
    tableLoading.value = true
  }

  try {
    // 运营版使用 GetShopListV2 接口
    const res = await apiManager.shopmgApi.GetShopListV2(data)
    if (res && res.rows) {
      // 优化数据处理：使用批量处理减少响应式更新
      const rows = res.rows || []

      const defaultFuncCodes = ['ZDCC', 'ZDHP', 'IMZDHF', 'ZDTG']

      // 批量处理数据，减少响应式触发
      const newShopList: any[] = new Array(rows.length)
      for (let i = 0; i < rows.length; i++) {
        const item = { ...rows[i] } // 浅拷贝避免修改原数据

        // 强制使用当前查询的 shopType，确保LOGO正确显示
        // 因为切换店铺类型时，后端可能返回旧的 shop_type 值
        const currentShopType = data.filter?.shopType
        if (currentShopType !== undefined) {
          item.shop_type = Number(currentShopType)
        }

        if (item.img && !item.img.startsWith('http')) {
          item.img = `http://${item.img}`
        }
        item.tooltipshow = false

        // 运营版返回的数据结构中，func_enable 在 extra_data 中
        const funcSource = item.extra_data?.func_enable

        if (Array.isArray(funcSource) && funcSource.length > 0) {
          updateFuncInfo(item, funcSource)
          // 处理运营版到期时间
          const appdataFunc = funcSource.find((func: any) => func.code === 'APPDATA')
          if (appdataFunc && appdataFunc.end_time) {
            item.appendtime = appdataFunc.end_time.slice(0, 10)
          }
        } else {
          // 批量设置默认值
          for (let j = 0; j < defaultFuncCodes.length; j++) {
            const code = defaultFuncCodes[j]
            item[code] = false
            item[`${code}time`] = '已到期'
          }
          item.CPDTtime = ''
        }

        if (item.work_time?.WorkTimeList) {
          const [workTime] = item.work_time.WorkTimeList
          item.yetime = workTime ? `${workTime.Start.slice(0, -3)}-${workTime.End.slice(0, -3)}` : ''
        } else {
          item.yetime = ''
        }

        newShopList[i] = item
      }

      // 响应返回时校验：若用户已切换到其他店铺类型，忽略本次结果（避免旧数据覆盖新选择）
      if (requestedShopType !== undefined && requestedShopType !== currentShopType.value) {
        return // 用户已切换，不更新
      }
      // 使用 nextTick 批量更新，减少响应式触发次数
      // 使用展开运算符创建新数组，确保 Vue 能检测到所有变化（包括 shop_type）
      nextTick(() => {
        shopList.value = [...newShopList] as any[]
        total.value = res.total || 0
      })
    }
  } finally {
    // 仅当本请求仍是最新请求时清除 loading，避免快速切换时旧请求先返回导致 loading 提前消失
    if (requestedShopType === latestRequestShopType) {
      tableLoading.value = false
      isFetching = false
    }
  }
}

/**
 * 处理筛选参数变化（从 Screen 组件触发）
 */
const setParams = (data: any) => {
  queryParams.filter = { ...data, shopType: currentShopType.value }
  queryParams.page = 1 // 筛选时重置页码
  saveCurrentShopTypeState()
  getShopList(queryParams, true) // 保持旧数据，避免闪烁
}

/**
 * 店铺类型改变
 */
const handleShopTypeChange = (shopType: ShopType) => {
  console.log('🎯 [handleShopTypeChange] 切换店铺类型:', currentShopType.value, '->', shopType)

  // 如果店铺类型没有变化，不执行任何操作
  if (currentShopType.value === shopType) {
    console.log('⏸️ [handleShopTypeChange] 类型未变化，跳过')
    return
  }

  // 快速连续点击不同店铺类型时：允许新点击覆盖，不阻塞（避免“点击无反应”）
  if (isFetching || isChangingShopType) {
    isFetching = false // 让新请求能执行，旧请求返回时会被忽略（见 getShopList 中的 shopType 校验）
  }

  // 清除之前的切换延迟定时器（与功能版一致）
  if (changingTimer) {
    clearTimeout(changingTimer)
    changingTimer = null
  }

  console.log('🔄 [handleShopTypeChange] 设置 isChangingShopType = true')
  isChangingShopType = true

  // 保存当前店铺类型的状态
  saveCurrentShopTypeState()

  // 更新当前店铺类型
  const previousShopType = currentShopType.value
  currentShopType.value = shopType
  console.log('✅ [handleShopTypeChange] currentShopType 已更新为:', shopType)

  // 保存到 sessionStorage（运营版专用）
  saveCurrentShopType(shopType)
  // 同时同步保存到功能版的 sessionStorage，确保功能版跳转时使用正确的店铺类型
  try {
    sessionStorage.setItem('mtFeatureV2_currentShopType', shopType.toString())
    console.log('💾 [handleShopTypeChange] 同步保存到功能版 sessionStorage')
  } catch {}

  // 如果在运营版里切换到不支持运营版的店铺类型：跳回基础版
  if (shopType !== ShopType.美团 && shopType !== ShopType.美团闪购 && shopType !== ShopType.京东到家) {
    console.log('⚠️ [handleShopTypeChange] 不支持运营版，跳转到基础版')
    router.push('/shop-v2/index')
    nextTick(() => {
      isChangingShopType = false
    })
    return
  }

  // 更新 queryParams 中的 shopType
  queryParams.filter.shopType = shopType

  // 恢复新店铺类型的状态
  restoreShopTypeState(shopType)

  // 切换店铺类型时，先清空旧数据
  shopList.value = []

  // 加载新数据
  getShopList(queryParams, false).finally(() => {
    nextTick(() => {
      changingTimer = setTimeout(() => {
        console.log('✅ [handleShopTypeChange] 切换完成, isChangingShopType = false')
        isChangingShopType = false
        changingTimer = null
      }, 500)
    })
  })
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
            // 刷新店铺列表
            getShopList(queryParams)
          }
        })
      }
    })
    .catch(() => {})
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
    1002: 'open-dy-tuangou-capture'
  }

  const params = {
    name: name || '',
    shop_type: targetShopType
  }

  ;(globalThis as any).electron.openBrowser(invokeMap[targetShopType as number], params, async (res: any) => {
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
 * 处理刷新按钮点击
 */
const handleRefresh = () => {
  isRefreshing = true
  saveCurrentShopType(currentShopType.value)

  getShopList(queryParams).finally(() => {
    nextTick(() => {
      setTimeout(() => {
        isRefreshing = false
      }, 100)
    })
  })
}

/**
 * 搜索
 */
const handleSearch = () => {
  queryParams.page = 1
  getShopList(queryParams)
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
  // 合并筛选参数到 queryParams.filter，保留其他筛选条件
  Object.keys(filterData).forEach((key: string) => {
    if (filterData[key] === undefined || filterData[key] === null) {
      // 如果值为 undefined 或 null，则清除该筛选条件
      ;(queryParams.filter as any)[key] = undefined
    } else {
      ;(queryParams.filter as any)[key] = filterData[key]
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

// 获取功能列表
const loadFunctionOptions = async () => {
  try {
    functionOptions.value = await getRenewFunctionList(currentShopType.value)

    // 运营版默认选择"运营版"功能（APPDATA）
    if (functionOptions.value.length > 0) {
      const appdata = functionOptions.value.find(item => item.code === 'APPDATA')
      if (appdata) {
        selectedFunctionCode.value = appdata.code
        selectedFunctionName.value = appdata.name
      } else {
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
  // 如果即将到期对话框打开，刷新列表
  if (expiringDialogVisible.value) {
    getExpiringShops()
  }
}

// 监听功能代码变化，同步更新功能名称
watch(selectedFunctionCode, newCode => {
  const selectedOption = functionOptions.value.find(item => item.code === newCode)
  if (selectedOption) {
    selectedFunctionName.value = selectedOption.name
  }
})

// 即将到期对话框相关
const expiringDialogVisible = ref(false)
const selectedExpiringShops = ref<any[]>([])

// 打开即将到期对话框
const openExpiringDialog = () => {
  expiringDialogVisible.value = true
  expiringPage.value = 1
  getExpiringShops(1)
  selectedExpiringShops.value = []
}

// 关闭即将到期对话框
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

// 处理即将到期店铺选择变化
const handleExpiringSelectionChange = (shops: any[]) => {
  selectedExpiringShops.value = shops
}

// 获取店铺到期时间（剩余天数格式）
const getExpiringTime = (row: any) => {
  const funcSource = row.extra_data?.func_enable
  if (!Array.isArray(funcSource)) return '未知'

  const appdataFunc = funcSource.find((func: any) => func.code === 'APPDATA')
  if (!appdataFunc || !appdataFunc.end_time) return '未知'

  try {
    const endDate = new Date(appdataFunc.end_time)
    if (isNaN(endDate.getTime())) return '未知'

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
    return '未知'
  }
}

// 判断是否已到期
const isExpired = (row: any) => {
  const funcSource = row.extra_data?.func_enable
  if (!Array.isArray(funcSource)) return false

  const appdataFunc = funcSource.find((func: any) => func.code === 'APPDATA')
  if (!appdataFunc || !appdataFunc.end_time) return false

  try {
    const endDate = new Date(appdataFunc.end_time)
    if (isNaN(endDate.getTime())) return false
    return endDate <= new Date()
  } catch {
    return false
  }
}

// 单个店铺续费
const renewSingleShop = (row: any) => {
  selectedShopsForRenew.value = [row]
  selectedFunctionCode.value = 'APPDATA'
  selectedFunctionName.value = '运营版'
  batchRenewDialogVisible.value = true
}

// 批量续费即将到期店铺
const batchRenewExpiringShops = () => {
  if (selectedExpiringShops.value.length === 0) {
    gp.$baseMessage('请选择要续费的店铺', 'warning', 'hey')
    return
  }
  selectedShopsForRenew.value = selectedExpiringShops.value
  selectedFunctionCode.value = 'APPDATA'
  selectedFunctionName.value = '运营版'
  batchRenewDialogVisible.value = true
}

// 授权异常对话框相关
const authErrorDialogVisible = ref(false)
const fixingAuthIds = ref<number[]>([])

// 打开授权异常对话框
const openAuthErrorDialog = () => {
  authErrorDialogVisible.value = true
  authErrorPage.value = 1
  getAuthErrorShops(1)
}

// 关闭授权异常对话框
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

// 修复授权
const fixAuth = async (row: any) => {
  if (fixingAuthIds.value.includes(row.id)) {
    return
  }

  fixingAuthIds.value.push(row.id)

  // 饿了么官方（复制版）使用后端授权地址，不使用 electron.openBrowser
  if (row.shop_type === ShopType.饿了么官方) {
    try {
      const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
      window.open(authResult.Url, '_blank')
      gp.$baseMessage('请在打开的页面中完成授权', 'info', 'hey')
    } catch (error: any) {
      gp.$baseMessage('获取授权地址失败: ' + (error.message || '未知错误'), 'error', 'hey')
    } finally {
      fixingAuthIds.value = fixingAuthIds.value.filter(id => id !== row.id)
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
    1002: 'open-dy-tuangou-capture'
  }

  const params = {
    name: row.name || '',
    shop_type: row.shop_type
  }

  const electron = (globalThis as any).electron
  if (!electron || !electron.openBrowser) {
    gp.$baseMessage('当前环境不支持修复授权操作', 'error', 'hey')
    const index = fixingAuthIds.value.indexOf(row.id)
    if (index > -1) {
      fixingAuthIds.value.splice(index, 1)
    }
    return
  }

  ;(globalThis as any).electron.openBrowser(invokeMap[row.shop_type as number], params, async (res: any) => {
    try {
      const data = {
        shop_type: params.shop_type,
        shop_user: '',
        shop_pwd: '',
        cookies: res.cookies
      }

      const res1: any = await addShop(data)
      if (res1.code === 200) {
        gp.$baseMessage('店铺修复成功!', 'success', 'hey')
        // 刷新授权异常列表（当前页）
        await getAuthErrorShops(authErrorPage.value)
        // 刷新授权异常总数
        await getAuthErrorShopCount()
        // 刷新主列表
        getShopList(queryParams, false)
        // 刷新统计数据
        initStatusCount()
      } else {
        gp.$baseMessage('店铺修复失败: ' + (res1.message || '未知错误'), 'error', 'hey')
      }
    } catch (error: any) {
      console.error('修复授权失败:', error)
      gp.$baseMessage('修复授权失败: ' + (error.message || '未知错误'), 'error', 'hey')
    } finally {
      const index = fixingAuthIds.value.indexOf(row.id)
      if (index > -1) {
        fixingAuthIds.value.splice(index, 1)
      }
    }
  })
}

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
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }]
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
              type: groupForm.type
            })
          } else {
            // 创建分组
            res = await addGroup({
              Parent: currentGroupDetail.value ? currentGroupDetail.value.Member?.id : null,
              name: groupForm.name,
              notes: '',
              type: groupForm.type
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
      const promises = flatList.map(async item => {
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
  })
    .then(async () => {
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
    })
    .catch(() => {})
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
const targetGroupId = ref<number>(0)
const currentChangeShop = ref<any>(null)
const allGroupOptions = ref<any[]>([])

// 修改单个店铺分组
const changeShopGroup = async (row: any) => {
  currentChangeShop.value = row
  targetGroupId.value = 0
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
        groups.forEach(group => {
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
  const shops = isBatch ? selectedGroupShops.value : currentChangeShop.value ? [currentChangeShop.value] : []

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
  targetGroupId.value = 0
}

// 从分组移除单个店铺
const removeShopFromGroup = async (row: any) => {
  ElMessageBox.confirm(`确定要将"${row.name}"从当前分组移除吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
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
    })
    .catch(() => {})
}

// 批量修改店铺分组
const batchChangeShopGroup = async () => {
  if (selectedGroupShops.value.length === 0) {
    gp.$baseMessage('请选择要修改的店铺', 'warning', 'hey')
    return
  }
  currentChangeShop.value = null // 标记为批量操作
  targetGroupId.value = 0
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
  })
    .then(async () => {
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
    })
    .catch(() => {})
}

// 标记是否已经初始化过数据（按店铺类型）
const initializedShopTypes = ref<Set<ShopType>>(new Set())

// 全局刷新事件处理函数
let refreshHandler: (() => void) | null = null

/**
 * 在组件挂载之前订阅全局刷新事件（顶部刷新按钮）
 */
onBeforeMount(() => {
  const gp = (globalThis as any).$baseSub
  if (gp) {
    refreshHandler = () => {
      console.log('🔄 [reload-router-view] 接收到全局刷新事件')
      console.log('🔄 [reload-router-view] 设置 isRefreshing = true')

      // 设置刷新标志，防止 onActivated 误触发
      isRefreshing = true

      // 保存当前店铺类型
      saveCurrentShopType(currentShopType.value)

      // 执行刷新
      nextTick(() => {
        getShopList(queryParams).finally(() => {
          setTimeout(() => {
            console.log('✅ [reload-router-view] 刷新完成, isRefreshing = false')
            isRefreshing = false
          }, 300)
        })
      })
    }

    // 订阅全局刷新事件
    gp('reload-router-view', refreshHandler)
    console.log('📡 [onBeforeMount] 已订阅全局刷新事件')
  }
})

/**
 * 组件卸载前取消订阅
 */
onBeforeUnmount(() => {
  const gp = (globalThis as any).$baseSub
  if (gp && refreshHandler) {
    gp('reload-router-view', refreshHandler)
    console.log('🔕 [onBeforeUnmount] 已取消订阅全局刷新事件')
  }
})

// 初始化时加载数据（仅首次挂载时执行）
onMounted(() => {
  console.log('🎯 [onMounted] 开始初始化, currentShopType:', currentShopType.value)

  // 从 sessionStorage 恢复店铺类型
  const savedShopType = getSavedShopType()
  if (savedShopType !== currentShopType.value) {
    currentShopType.value = savedShopType
  }

  // 检查当前店铺类型是否支持运营版（美团餐饮、美团闪购、京东到家支持）
  if (
    currentShopType.value !== ShopType.美团 &&
    currentShopType.value !== ShopType.美团闪购 &&
    currentShopType.value !== ShopType.京东到家
  ) {
    console.log('⚠️ [onMounted] 当前类型不支持运营版，重定向到基础版')
    router.push('/shop-v2/index')
    return
  }

  // ⚠️ 重要：保存初始店铺类型到 sessionStorage
  console.log('💾 [onMounted] 保存初始店铺类型到 sessionStorage:', currentShopType.value)
  saveCurrentShopType(currentShopType.value)

  // 恢复当前店铺类型的状态
  restoreShopTypeState(currentShopType.value)

  if (!initializedShopTypes.value.has(currentShopType.value)) {
    getShopList(queryParams)
    initializedShopTypes.value.add(currentShopType.value)
  }

  // 初始化统计数据
  initStatusCount()
})

/**
 * 组件激活时的处理逻辑
 */
onActivated(() => {
  console.log(
    '🎯 [onActivated] 组件激活, currentShopType:',
    currentShopType.value,
    'isRefreshing:',
    isRefreshing,
    'isChangingShopType:',
    isChangingShopType
  )

  // 如果正在刷新或正在切换店铺类型，不执行任何操作，避免重复加载
  if (isRefreshing || isChangingShopType) {
    console.log(
      '⏸️ [onActivated] 正在刷新或切换，跳过 (isRefreshing:',
      isRefreshing,
      'isChangingShopType:',
      isChangingShopType,
      ')'
    )
    return
  }

  // 从功能版点击运营版进入时，sessionStorage 已保存正确的店铺类型；若组件被 keep-alive 缓存，
  // currentShopType 可能仍是上次不支持运营版的类型（如美团医药），需优先从 sessionStorage 恢复
  const savedFromStorage = getSavedShopType()
  const savedSupportsOperation =
    savedFromStorage === ShopType.美团 ||
    savedFromStorage === ShopType.美团闪购 ||
    savedFromStorage === ShopType.京东到家
  const currentSupportsOperation =
    currentShopType.value === ShopType.美团 ||
    currentShopType.value === ShopType.美团闪购 ||
    currentShopType.value === ShopType.京东到家

  if (savedSupportsOperation && !currentSupportsOperation) {
    console.log('🔄 [onActivated] 从 sessionStorage 恢复店铺类型（功能版切回支持运营版类型后进入）:', savedFromStorage)
    currentShopType.value = savedFromStorage
    saveCurrentShopType(savedFromStorage)
  }

  // 检查当前店铺类型是否支持运营版（美团餐饮、美团闪购、京东到家支持）
  const isCurrentTypeValid =
    currentShopType.value === ShopType.美团 ||
    currentShopType.value === ShopType.美团闪购 ||
    currentShopType.value === ShopType.京东到家

  // 如果当前类型不是有效的运营版类型，重定向到基础版
  if (!isCurrentTypeValid) {
    console.log('⚠️ [onActivated] 当前类型不支持运营版，重定向到基础版')
    router.push('/shop-v2/index')
    return
  }

  console.log('✅ [onActivated] 保持当前店铺类型:', currentShopType.value)

  // 恢复当前店铺类型的状态
  restoreShopTypeState(currentShopType.value)

  // 如果该店铺类型还未初始化，则加载数据
  if (!initializedShopTypes.value.has(currentShopType.value)) {
    console.log('📡 [onActivated] 首次加载店铺类型:', currentShopType.value)
    getShopList(queryParams)
    initializedShopTypes.value.add(currentShopType.value)
    initStatusCount()
  } else {
    console.log('✅ [onActivated] 店铺类型已初始化，保持状态')
  }
})

/**
 * 监听店铺类型变化，重新获取统计数据
 */
watch(currentShopType, (newType, oldType) => {
  if (newType !== oldType && !isRefreshing) {
    initStatusCount()
  }
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

  // 运营版状态卡片样式（与基础版一致）
  .operate-status-card {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .status-entry {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
      box-sizing: border-box;

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

  // 即将到期对话框样式（与基础版一致）
  .expiring-shop-dialog {
    padding-bottom: 50px; // 大幅增加底部空间，确保翻页组件完整显示
    min-height: 400px; // 最小高度

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
      margin-top: 24px;
      padding-top: 16px;
      padding-bottom: 12px;
    }
  }

  // 授权异常对话框样式（与基础版一致）
  .auth-error-shop-dialog {
    padding-bottom: 50px; // 大幅增加底部空间，确保翻页组件完整显示
    min-height: 400px; // 最小高度

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 14px;
    }

    // 确保翻页组件完整显示
    .vab-pagination {
      margin-top: 24px;
      padding-top: 16px;
      padding-bottom: 12px;
    }
  }

  // 全局对话框样式调整（确保翻页组件完整显示）
  :deep(.el-dialog) {
    .el-dialog__body {
      padding-bottom: 80px !important; // 大幅增加底部空间
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
