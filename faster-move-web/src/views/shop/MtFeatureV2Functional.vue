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
          <el-button :type="'primary'" class="version-button"> 功能版 </el-button>
          <el-button
            v-if="showOperationVersion"
            :type="versionType === '运营版' ? 'primary' : 'default'"
            class="version-button"
            @click="switchToOperation"
          >
            运营版
          </el-button>
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
        <!-- 功能版功能状态卡片（移到回收站左边） -->
        <div class="operate-status-card">
          <!-- 即将到期卡片：只在有功能选项时显示（排除饿了么复制版） -->
          <div
            v-if="currentShopType !== ShopType.饿了么官方 && functionOptions.length > 0"
            class="status-entry warning"
            @click="openExpiringDialog"
          >
            <el-select
              v-model="expiringFunctionCode"
              placeholder="选择功能"
              size="small"
              class="function-select"
              @change="handleExpiringFunctionChange"
              @click.stop
            >
              <el-option v-for="item in functionOptions" :key="item.code" :label="item.name" :value="item.code" />
            </el-select>
            <span class="status-label">即将到期：</span>
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
            <el-tooltip content="执行已续费且未到期的功能" placement="top">
              <el-button
                v-if="showExecuteFuncButton"
                :type="executeFuncMode ? 'warning' : 'primary'"
                size="small"
                class="execute-func-btn"
                @click.stop="toggleExecuteFuncMode"
              >
                <el-icon style="margin-right: 4px">
                  <VideoPlay />
                </el-icon>
                {{ executeFuncMode ? '取消执行' : '执行功能' }}
              </el-button>
            </el-tooltip>
            <el-button
              v-if="executeFuncMode && selectedShopsForExecute.length > 0"
              type="primary"
              size="small"
              class="confirm-execute-btn"
              @click.stop="openExecuteFuncDialog"
            >
              <el-icon style="margin-right: 4px">
                <Check />
              </el-icon>
              确认执行
            </el-button>
          </div>
          <!-- 授权异常卡片：始终显示（包括饿了么复制版） -->
          <div class="status-entry danger" @click="openAuthErrorDialog">
            <span class="status-label">授权异常：</span>
            <span class="status-number" :class="{ 'blur-text': demoMode }">{{ authErrorShopCount }}</span>
            <span class="status-unit">家店铺</span>
          </div>
        </div>
        <el-button
          :icon="Download"
          type="success"
          :loading="exportLoading"
          style="margin-right: 8px"
          @click="openExportDialog"
        >
          导出店铺
        </el-button>
        <el-button :icon="Delete" type="danger" class="recycle-btn" @click="openRecycle">回收站</el-button>
        <el-button :icon="Monitor" type="primary" style="margin-left: 8px" @click="openFuncRunTaskCenter"
          >任务执行中心</el-button
        >
      </div>
    </div>
    <screen
      :query-params="queryParams.filter"
      :shop-type="currentShopType"
      :shop-type-str="getShopTypeStr(currentShopType)"
      @update-query-params="setParams"
    />
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
        :is-functional="true"
        :batch-renew-mode="batchRenewMode || executeFuncMode"
        @update-page="updatePage"
        @update-filter="handleFilterChange"
        @save-scroll="handleSaveScroll"
        @shop-selection-change="handleShopSelectionChange"
        @sort-change="handleSortChange"
      />
    </div>
    <!-- 导出店铺对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出店铺"
      width="480px"
      :close-on-click-modal="false"
      :before-close="closeExportDialog"
    >
      <div class="export-dialog-content">
        <div v-if="!exportLoading" class="export-settings">
          <el-form label-width="90px" size="default">
            <el-form-item label="导出页数">
              <el-input-number
                v-model="exportMaxPages"
                :min="1"
                :max="50"
                :step="1"
                controls-position="right"
                style="width: 140px"
              />
              <span style="margin-left: 8px; color: #909399; font-size: 13px">页（每页 {{ MAX_PAGE_SIZE }} 条）</span>
            </el-form-item>
            <el-form-item label="过滤条件">
              <el-tag v-if="queryParams.filter.word" type="info" style="margin-right: 6px"
                >关键词: {{ queryParams.filter.word }}</el-tag
              >
              <el-tag
                v-if="queryParams.filter.state !== undefined && queryParams.filter.state !== null"
                type="info"
                style="margin-right: 6px"
                >状态筛选</el-tag
              >
              <el-tag v-if="queryParams.filter.func_code" type="info" style="margin-right: 6px">功能筛选</el-tag>
              <el-tag v-if="queryParams.filter.group" type="info" style="margin-right: 6px">分组筛选</el-tag>
              <span
                v-if="
                  !queryParams.filter.word &&
                  queryParams.filter.state === undefined &&
                  !queryParams.filter.func_code &&
                  !queryParams.filter.group
                "
                style="color: #909399; font-size: 13px"
                >全部店铺</span
              >
            </el-form-item>
          </el-form>
          <div style="color: #909399; font-size: 12px; margin-top: 4px">
            <el-icon style="vertical-align: middle; margin-right: 4px">
              <InfoFilled />
            </el-icon>
            将按当前过滤条件分页查询，每页间隔 1~3 秒，避免请求过于频繁
          </div>
        </div>
        <div v-else class="export-progress">
          <el-progress :percentage="exportProgress" :stroke-width="10" style="margin-bottom: 16px" />
          <div style="text-align: center; color: #606266; font-size: 14px">
            {{ exportStatusText }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button :disabled="exportLoading" @click="closeExportDialog">取消</el-button>
        <el-button type="primary" :loading="exportLoading" :disabled="exportLoading" @click="startExport">
          {{ exportLoading ? '导出中...' : '开始导出' }}
        </el-button>
      </template>
    </el-dialog>
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
    <!-- 批量续费对话框（复用即将到期的功能选择） -->
    <BatchRenewDialog
      v-model="batchRenewDialogVisible"
      :shop-list="selectedShopsForRenew"
      :shop-type="currentShopType"
      :function-code="expiringFunctionCode"
      :function-name="expiringFunctionName"
      @renew-success="handleRenewSuccess"
    />
    <!-- 执行功能对话框（店铺从批量续费模式下的已选店铺传入） -->
    <ExecuteFuncDialog
      v-model="executeFuncDialogVisible"
      :shop-type="currentShopType"
      :function-code="expiringFunctionCode"
      :function-name="expiringFunctionName"
      :shop-list="selectedShopsForExecute"
      @success="() => {}"
    />
    <!-- 任务执行中心对话框 -->
    <FuncRunTaskCenterDialog
      v-model="funcRunTaskCenterVisible"
      :shop-type="currentShopType"
      :function-options="functionOptions"
    />
    <!-- 即将到期店铺对话框（参考基础版实现） -->
    <el-dialog
      v-model="expiringDialogVisible"
      :title="`${expiringFunctionName}即将到期店铺`"
      width="1000px"
      :before-close="closeExpiringDialog"
      destroy-on-close
    >
      <div class="expiring-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ expiringShopTotal }} 家店铺即将到期（7天内）</span>
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
          :current-page="expiringShopPage"
          :page-size="expiringShopPageSize"
          :total="expiringShopTotal"
          style="margin-top: 16px"
          @current-change="handleExpiringPageChange"
          @size-change="handleExpiringPageSizeChange"
        />
      </div>
    </el-dialog>
    <!-- 授权异常店铺对话框（参考基础版实现） -->
    <el-dialog
      v-model="authErrorDialogVisible"
      title="授权异常店铺"
      width="900px"
      :before-close="closeAuthErrorDialog"
      destroy-on-close
    >
      <div class="auth-error-shop-dialog">
        <div class="dialog-header">
          <span>共 {{ authErrorShopTotal }} 家店铺授权异常</span>
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
          :current-page="authErrorShopPage"
          :page-size="authErrorShopPageSize"
          :total="authErrorShopTotal"
          style="margin-top: 16px"
          @current-change="handleAuthErrorPageChange"
          @size-change="handleAuthErrorPageSizeChange"
        />
      </div>
    </el-dialog>
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
  </div>
</template>
<script setup lang="ts">
import Screen from '/@/views/shop/componentsV2/Screen.vue'
import { getShop, getShopFdmv, bindShop, addShop, getGroup, getFuncCount } from '/@/api/shop.ts'
import { addGroup, updateGroup, delGroup } from '/@/api/group.ts'
import { getBindShopList, connectShopUserGroup, connectShopUserRemoveGroup } from '/@/api/group.ts'
import ShopTable from '/@/views/shop/componentsV2/ShopTable.vue'
import { useRoute, useRouter } from 'vue-router'
import { watch, nextTick, computed, ref, reactive, onMounted, onActivated, onBeforeMount, onBeforeUnmount } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import {
  Key,
  Delete,
  Plus,
  Tickets,
  Check,
  Folder,
  Download,
  Monitor,
  InfoFilled,
  VideoPlay
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { gp } from '/@vab/plugins/vab'
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { openShopWindow } from '/@/utils/openShopWin'
import recycle from '/@/views/shop/componentsV2/Recycle.vue'
import BatchRenewDialog from '/@/views/shop/componentsV2/BatchRenewDialog.vue'
import ExecuteFuncDialog from '/@/views/shop/componentsV2/ExecuteFuncDialog.vue'
import FuncRunTaskCenterDialog from '/@/views/shop/componentsV2/FuncRunTaskCenterDialog.vue'
import { apiManager } from '@/TsModel/Api/ApiManager'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { getShopListFunctionColumns, getRenewFunctionList } from '/@/utils/functionCache.ts'

// 确保 vab-icon 可用（全局组件）

const route = useRoute()
const router = useRouter()

// 检查是否在Electron环境中
const isElectron = !!(globalThis as any).electron

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 店铺类型选项（抖音即时零售和饿了么复制版在功能版页面显示，但使用基础版逻辑）
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
    const saved = sessionStorage.getItem('mtFeatureV2_currentShopType')
    if (saved) {
      const shopType = parseInt(saved, 10) as ShopType
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
    sessionStorage.setItem('mtFeatureV2_currentShopType', shopType.toString())
  } catch (error) {
    console.error('保存店铺类型失败:', error)
  }
}

// 版本类型（功能版、运营版）
const versionType = ref('功能版')

// 判断是否显示运营版按钮（美团餐饮、美团闪购、京东到家有运营版功能）
const showOperationVersion = computed(() => {
  return (
    currentShopType.value === ShopType.美团 ||
    currentShopType.value === ShopType.美团闪购 ||
    currentShopType.value === ShopType.京东到家
  )
})

// 切换到运营版
const switchToOperation = () => {
  // 进入运营版前，同步当前店铺类型给运营版页面
  try {
    sessionStorage.setItem('mtFeatureV2Operation_currentShopType', currentShopType.value.toString())
  } catch {}
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
    1001: 'jd-home-feature' // 京东团购使用京东到家的 typeStr
  }
  return typeMap[shopType] || 'mt-feature'
}

const tableLoading = ref(false)
const total = ref(0)
const shopList = ref<any[]>([])

/**
 * 加载状态标志
 */
let isFetching = false // 防止重复加载店铺列表
let isChangingShopType = false // 是否在切换店铺类型
let latestRequestShopType: ShopType | undefined // 最新请求的店铺类型，用于竞态时只让最新请求清除 loading
let isRefreshing = false // 是否正在刷新（防止 onActivated 误触发）
let changingTimer: ReturnType<typeof setTimeout> | null = null // 切换延迟定时器
let shouldResetFilters = false // 是否需要重置筛选（刷新时使用）

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
        func_code: undefined,
        func_state: undefined,
        avtag: undefined
      },
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
}

/**
 * 恢复指定店铺类型的状态
 * @returns 返回滚动位置
 */
/**
 * 恢复指定店铺类型的状态
 * @param shopType - 店铺类型
 * @param skipFilterRestore - 是否跳过筛选状态恢复（用于刷新重置）
 * @returns 返回滚动位置
 */
const restoreShopTypeState = (shopType: ShopType, skipFilterRestore: boolean = false): number => {
  const state = getShopTypeState(shopType)

  if (skipFilterRestore) {
    // 只恢复分页，不恢复筛选条件
    queryParams.page = state.page
    queryParams.pageSize = state.pageSize
    queryParams.filter.shopType = shopType
  } else {
    // 完整恢复状态（包括筛选）
    queryParams.page = state.page
    queryParams.pageSize = state.pageSize
    queryParams.filter = { ...state.filter, shopType }
  }

  // 确保 currentShopType 同步更新
  if (currentShopType.value !== shopType) {
    currentShopType.value = shopType
    saveCurrentShopType(shopType)
  }

  return state.scrollPosition || 0
}

// 功能版
defineOptions({
  name: 'MtFeatureV2Functional'
})
const queryParams = reactive<{
  page: number
  pageSize: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
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
}>({
  page: 1,
  pageSize: 20,
  order_by: undefined,
  order_direction: undefined,
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
  }
})

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
    const res: any = await getShopFdmv(data)
    if (res && res.code === 200) {
      // 优化数据处理：使用批量处理减少响应式更新
      const rows = res.data.rows || []
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

        // 优先使用 func_info，如果没有则使用 extra_data?.func_enable
        let funcSource = item.func_info
        if (!funcSource || !Array.isArray(funcSource) || funcSource.length === 0) {
          funcSource = item.extra_data?.func_enable
        }

        if (Array.isArray(funcSource) && funcSource.length > 0) {
          updateFuncInfo(item, funcSource)
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
      nextTick(() => {
        shopList.value = newShopList as any[]
        total.value = res.data.total || 0
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

const setParams = (data: any) => {
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
  if (currentShopType.value === shopType) return

  // 快速连续点击不同店铺类型时：允许新点击覆盖，不阻塞（避免“点击无反应”）
  if (isFetching || isChangingShopType) {
    isFetching = false // 让新请求能执行，旧请求返回时会被忽略（见 getShopList 中的 shopType 校验）
  }

  // 清除之前的切换延迟定时器
  if (changingTimer) {
    clearTimeout(changingTimer)
    changingTimer = null
  }

  isChangingShopType = true
  saveCurrentShopTypeState()

  // 立即同步更新 currentShopType
  currentShopType.value = shopType
  saveCurrentShopType(shopType)

  // 恢复新店铺类型的状态
  restoreShopTypeState(shopType)

  // 更新 queryParams 中的 shopType
  queryParams.filter.shopType = shopType

  // 切换店铺类型时清空旧数据并显示 loading（与运营版一致，避免卡顿感）
  shopList.value = []
  getShopList(queryParams, false).finally(() => {
    nextTick(() => {
      changingTimer = setTimeout(() => {
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
 * 任务执行中心
 */
const funcRunTaskCenterVisible = ref(false)
const openFuncRunTaskCenter = () => {
  funcRunTaskCenterVisible.value = true
}

/**
 * 处理店铺恢复成功事件，刷新列表
 */
const handleShopRecovered = () => {
  getShopList(queryParams)
}

/**
 * 导出店铺功能
 */
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportMaxPages = ref(5)
const exportProgress = ref(0)
const exportStatusText = ref('')

const openExportDialog = () => {
  exportProgress.value = 0
  exportStatusText.value = ''
  exportDialogVisible.value = true
}

const closeExportDialog = () => {
  if (exportLoading.value) return
  exportDialogVisible.value = false
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getShopTypeLabel = (shopType: ShopType): string => {
  const opt = shopTypeOptions.find(o => o.value === shopType)
  return opt ? opt.label : '店铺'
}

const getAuthStateLabel = (state: number): string => {
  const map: Record<number, string> = { 1: '正常', 2: '即将到期', 3: '授权异常', 4: '已停用' }
  return map[state] || String(state)
}

const startExport = async () => {
  exportLoading.value = true
  exportProgress.value = 0
  exportStatusText.value = '准备导出...'

  try {
    // 确保功能列表已加载（用于列头中文名映射）
    if (functionOptions.value.length === 0) {
      await loadFunctionOptions()
    }

    const allShops: any[] = []
    const pageSize = MAX_PAGE_SIZE
    const maxPages = exportMaxPages.value

    for (let page = 1; page <= maxPages; page++) {
      exportStatusText.value = `正在查询第 ${page} / ${maxPages} 页...`
      exportProgress.value = Math.round(((page - 1) / maxPages) * 80)

      const data = {
        page,
        pageSize,
        filter: { ...queryParams.filter },
        order_by: queryParams.order_by,
        order_direction: queryParams.order_direction
      }

      const res: any = await getShopFdmv(data)
      if (res?.code !== 200) {
        gp.$baseMessage(`第 ${page} 页查询失败：${res?.msg || '未知错误'}`, 'error', 'hey')
        break
      }

      const rows: any[] = res.data?.rows || []
      allShops.push(...rows)

      // 如果本页数据不足一页，说明已到最后一页，不需要继续
      if (rows.length < pageSize) break

      // 如果不是最后一页，间隔 1~3 秒
      if (page < maxPages) {
        const delay = 1000 + Math.random() * 2000
        exportStatusText.value = `第 ${page} 页完成，等待 ${(delay / 1000).toFixed(1)} 秒后继续...`
        await sleep(delay)
      }
    }

    if (allShops.length === 0) {
      gp.$baseMessage('没有查询到任何店铺数据', 'warning', 'hey')
      return
    }

    exportStatusText.value = `共获取 ${allShops.length} 条数据，正在生成 Excel...`
    exportProgress.value = 85

    await generateExcel(allShops)

    exportProgress.value = 100
    exportStatusText.value = `导出成功！共导出 ${allShops.length} 条店铺数据`
    gp.$baseMessage(`成功导出 ${allShops.length} 条店铺数据`, 'success', 'hey')

    setTimeout(() => {
      exportDialogVisible.value = false
      exportLoading.value = false
      exportProgress.value = 0
      exportStatusText.value = ''
    }, 1500)
  } catch (error: any) {
    console.error('导出失败:', error)
    gp.$baseMessage('导出失败：' + (error?.message || '未知错误'), 'error', 'hey')
    exportLoading.value = false
    exportProgress.value = 0
    exportStatusText.value = ''
  }
}

const generateExcel = async (shops: any[]) => {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const shopTypeLabel = getShopTypeLabel(currentShopType.value)
  const sheet = workbook.addWorksheet(`${shopTypeLabel}店铺列表`)

  // 定义列
  const columns: { header: string; key: string; width: number }[] = [
    { header: '店铺ID', key: 'id', width: 12 },
    { header: '店铺名称', key: 'name', width: 30 },
    { header: '平台ID', key: 'office_id', width: 18 },
    { header: '城市', key: 'city', width: 14 },
    { header: '授权状态', key: 'state_label', width: 12 },
    { header: '备注', key: 'notes', width: 20 },
    { header: '分组', key: 'group_name', width: 16 },
    { header: '营业时间', key: 'yetime', width: 18 },
    { header: '店铺类型', key: 'shop_type_label', width: 14 }
  ]

  // 动态添加功能列（从第一条数据的 func_info 中获取，用 functionOptions 映射中文名称）
  const funcCodeNameMap: Record<string, string> = {}
  functionOptions.value.forEach((opt: any) => {
    if (opt.code) funcCodeNameMap[opt.code] = opt.name
  })

  const funcCodes: string[] = []
  if (shops.length > 0) {
    const firstShop = shops[0]
    const funcSource = firstShop.func_info || firstShop.extra_data?.func_enable || []
    if (Array.isArray(funcSource)) {
      funcSource.forEach((f: any) => {
        if (f?.code) {
          const funcName = funcCodeNameMap[f.code] || f.code
          funcCodes.push(f.code)
          columns.push({ header: funcName, key: `func_${f.code}`, width: 14 })
          columns.push({ header: `${funcName}到期时间`, key: `func_${f.code}_time`, width: 16 })
        }
      })
    }
  }

  sheet.columns = columns

  // 表头样式
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, size: 11 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4FF' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 22

  // 填充数据行
  shops.forEach((shop: any) => {
    const funcSource = shop.func_info || shop.extra_data?.func_enable || []
    const funcMap: Record<string, any> = {}
    if (Array.isArray(funcSource)) {
      funcSource.forEach((f: any) => {
        if (f?.code) funcMap[f.code] = f
      })
    }

    const rowData: Record<string, any> = {
      id: shop.id || '',
      name: shop.name || '',
      office_id: shop.office_id || '',
      city: shop.city || '',
      state_label: getAuthStateLabel(shop.state),
      notes: shop.notes || '',
      group_name: shop.group_name || '',
      yetime: shop.work_time?.WorkTimeList?.[0]
        ? `${shop.work_time.WorkTimeList[0].Start?.slice(0, 5)}-${shop.work_time.WorkTimeList[0].End?.slice(0, 5)}`
        : '',
      shop_type_label: shopTypeLabel
    }

    funcCodes.forEach(code => {
      const f = funcMap[code]
      rowData[`func_${code}`] = f ? (f.enable ? '已开启' : '未开启') : '-'
      rowData[`func_${code}_time`] = f?.end_time ? f.end_time.slice(0, 10) : '-'
    })

    sheet.addRow(rowData)
  })

  // 数据行样式：斑马纹
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    row.height = 18
    row.alignment = { vertical: 'middle' }
    if (rowNumber % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
    }
  })

  // 生成并下载
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  link.href = url
  link.download = `${shopTypeLabel}店铺列表_${dateStr}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
// 处理排序变化
const handleSortChange = (sortData: { field: string; order: 'asc' | 'desc' | null }) => {
  if (sortData.field && sortData.order) {
    queryParams.order_by = sortData.field
    queryParams.order_direction = sortData.order
  } else {
    queryParams.order_by = undefined
    queryParams.order_direction = undefined
  }
  // 排序时重置页码为第一页
  queryParams.page = 1
  getShopList(queryParams)
}

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
const executeFuncMode = ref(false)
const selectedShopsForExecute = ref<any[]>([])
const executeFuncDialogVisible = ref(false)
const showExecuteFuncButton = ref(false)
const selectedFunctionCode = ref('')
const selectedFunctionName = ref('')
const batchRenewDialogVisible = ref(false)
const functionOptions = ref<any[]>([])

// 常量定义
const FUNC_STATE_EXPIRING = 2 // 即将到期状态
const AUTH_ERROR_STATE = 3 // 授权异常状态
const MAX_PAGE_SIZE = 100 // API限制每页最大数量
const DEFAULT_PAGE_SIZE = 10 // 默认每页数量（改为10条）
const COUNT_PAGE_SIZE = 1 // 仅获取总数时的页面大小

// 功能即将到期和授权异常相关状态
const expiringFunctionCode = ref('ZDCC') // 当前选择的功能代码（用于到期店铺筛选）
const expiringFunctionName = ref('自动出餐') // 当前选择的功能名称
const expiringShopCount = ref(0)
const authErrorShopCount = ref(0)
const expiringShopList = ref<any[]>([]) // 当前页显示的店铺列表
const expiringShopListAll = ref<any[]>([]) // 所有即将到期的店铺列表（已排序）
const authErrorShopList = ref<any[]>([])
const expiringLoading = ref(false)
const authErrorLoading = ref(false)
const expiringDialogVisible = ref(false)
const authErrorDialogVisible = ref(false)
const selectedExpiringShops = ref<any[]>([])
const fixingAuthIds = ref<number[]>([])

// 即将到期店铺分页状态
const expiringShopPage = ref(1)
const expiringShopPageSize = ref(10) // 改为每页10条
const expiringShopTotal = ref(0)

// 授权异常店铺分页状态
const authErrorShopPage = ref(1)
const authErrorShopPageSize = ref(10) // 改为每页10条
const authErrorShopTotal = ref(0)

/**
 * 获取功能列表（根据当前店铺类型）
 */
const loadFunctionOptions = async () => {
  try {
    // 饿了么复制版（shopType=8）不支持激活任何功能：不显示到期卡片 & 不提供批量续费功能列表
    if (currentShopType.value === ShopType.饿了么官方) {
      functionOptions.value = []
      selectedFunctionCode.value = ''
      selectedFunctionName.value = ''
      expiringFunctionCode.value = ''
      expiringFunctionName.value = ''
      expiringShopCount.value = 0
      authErrorShopCount.value = 0
      showExecuteFuncButton.value = false
      return
    }

    functionOptions.value = await getRenewFunctionList(currentShopType.value)

    // 功能版：若当前选择仍在新列表中则保留，否则默认选择第一个功能
    if (functionOptions.value.length > 0) {
      const currentInList = functionOptions.value.find(item => item.code === expiringFunctionCode.value)
      if (currentInList) {
        selectedFunctionCode.value = currentInList.code
        selectedFunctionName.value = currentInList.name
        expiringFunctionCode.value = currentInList.code
        expiringFunctionName.value = currentInList.name
      } else {
        selectedFunctionCode.value = functionOptions.value[0].code
        selectedFunctionName.value = functionOptions.value[0].name
        expiringFunctionCode.value = functionOptions.value[0].code
        expiringFunctionName.value = functionOptions.value[0].name
      }
      checkExecuteFuncSupported()
    } else {
      showExecuteFuncButton.value = false
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
    selectedShopsForRenew.value = []
  } else {
    executeFuncMode.value = false
    selectedShopsForExecute.value = []
    loadFunctionOptions()
  }
}

// 切换执行功能模式
const toggleExecuteFuncMode = () => {
  executeFuncMode.value = !executeFuncMode.value
  if (!executeFuncMode.value) {
    selectedShopsForExecute.value = []
  } else {
    batchRenewMode.value = false
    selectedShopsForRenew.value = []
  }
}

// 处理店铺选择变化
const handleShopSelectionChange = (shops: any[]) => {
  if (batchRenewMode.value) {
    selectedShopsForRenew.value = shops
  } else if (executeFuncMode.value) {
    selectedShopsForExecute.value = shops
  }
}

// 确认续费（使用即将到期的功能选择）
const handleConfirmRenew = () => {
  if (selectedShopsForRenew.value.length === 0) {
    gp.$baseMessage('请选择要续费的店铺', 'warning', 'hey')
    return
  }
  if (!expiringFunctionCode.value) {
    gp.$baseMessage('请选择要续费的功能', 'warning', 'hey')
    return
  }
  batchRenewDialogVisible.value = true
}

// 获取即将到期的店铺数量（根据选择的功能代码）
const getExpiringShopCount = async () => {
  if (!expiringFunctionCode.value) {
    expiringShopCount.value = 0
    return
  }

  try {
    // 店铺多开（OPENSHOP）需要使用和筛选按钮相同的逻辑（func_code + func_state + time_state）
    // 因为店铺多开使用 EndTime 字段，需要 time_state 参数才能准确筛选
    if (expiringFunctionCode.value === 'OPENSHOP') {
      const data = {
        page: 1,
        pageSize: COUNT_PAGE_SIZE,
        filter: {
          shopType: currentShopType.value,
          func_code: 'OPENSHOP',
          func_state: FUNC_STATE_EXPIRING, // 即将到期 = 2
          time_state: 2 // 即将到期（映射到 EndTime 字段）
        }
      }

      const res: any = await getShopFdmv(data)
      expiringShopCount.value = res?.code === 200 ? res.data?.total || 0 : 0
    } else {
      // 其他功能使用统计接口 GetFuncCountV2
      const result = await apiManager.shopmgApi.GetFuncCountV2(currentShopType.value, expiringFunctionCode.value)

      if (result && result[expiringFunctionCode.value]) {
        // almost_end 是即将到期的店铺数量
        expiringShopCount.value = result[expiringFunctionCode.value].almost_end || 0
      } else {
        expiringShopCount.value = 0
      }
    }
  } catch (error) {
    console.error('获取即将到期店铺数量失败:', error)
    expiringShopCount.value = 0
  }
}

// 检查当前选择的功能是否支持自动执行（用于显示「执行功能」按钮）
const checkExecuteFuncSupported = async () => {
  if (!expiringFunctionCode.value) {
    showExecuteFuncButton.value = false
    return
  }
  try {
    const results = await apiManager.funcRunTaskApi.GetFuncConfSchemas({
      ShopType: currentShopType.value,
      FuncCodes: [expiringFunctionCode.value]
    })
    showExecuteFuncButton.value = (results ?? []).some(r => r.AutoRenewRun)
  } catch {
    showExecuteFuncButton.value = false
  }
}

const openExecuteFuncDialog = () => {
  executeFuncDialogVisible.value = true
}

// 处理功能选择变化
const handleExpiringFunctionChange = (funcCode: string) => {
  const selectedOption = functionOptions.value.find(item => item.code === funcCode)
  if (selectedOption) {
    expiringFunctionName.value = selectedOption.name
  }
  // 重新获取该功能的到期店铺数量
  getExpiringShopCount()
  // 检查是否支持执行功能
  checkExecuteFuncSupported()
  // 清空已排序的数据和缓存，下次打开对话框时会重新加载
  expiringShopListAll.value = []
  expiringShopTotal.value = 0
  expiringShopList.value = []
  lastLoadedFunctionCode.value = null
}

/**
 * 处理店铺数据展平（确保功能信息已展平到 item 上）
 * @param shopList 店铺列表
 * @returns 处理后的店铺列表
 */
const processShopsData = (shopList: any[]): any[] => {
  return shopList.map((item: any) => {
    const processedItem = { ...item }

    // 优先使用 func_info，如果没有则使用 extra_data?.func_enable
    let funcSource = processedItem.func_info
    if (!funcSource || !Array.isArray(funcSource) || funcSource.length === 0) {
      funcSource = processedItem.extra_data?.func_enable
    }

    if (Array.isArray(funcSource) && funcSource.length > 0) {
      updateFuncInfo(processedItem, funcSource)
    }

    return processedItem
  })
}

/**
 * 获取所有即将到期的店铺并排序（一次性获取所有数据，然后前端排序和分页）
 */
// 缓存已加载的功能代码，避免重复请求
const lastLoadedFunctionCode = ref<string | null>(null)
// 防重复请求标志
const isGettingExpiringShops = ref(false)

const getAllExpiringShops = async () => {
  if (!expiringFunctionCode.value) {
    expiringShopListAll.value = []
    expiringShopTotal.value = 0
    expiringShopList.value = []
    lastLoadedFunctionCode.value = null
    return
  }

  // 如果正在请求中，直接返回，避免重复请求
  if (isGettingExpiringShops.value) {
    return
  }

  // 如果功能代码没有变化且已有数据，直接使用缓存的数据
  if (
    lastLoadedFunctionCode.value === expiringFunctionCode.value &&
    expiringShopListAll.value.length > 0 &&
    expiringShopTotal.value > 0
  ) {
    // 只需更新当前页显示的数据
    updateExpiringShopListPage()
    return
  }

  try {
    isGettingExpiringShops.value = true
    expiringLoading.value = true

    // 构建请求参数
    // 店铺多开（OPENSHOP）需要使用 time_state 参数，和筛选按钮的逻辑保持一致
    const baseData: any = {
      page: 1,
      pageSize: MAX_PAGE_SIZE,
      filter: {
        shopType: currentShopType.value,
        func_code: expiringFunctionCode.value,
        func_state: FUNC_STATE_EXPIRING
        // 不设置 state，这样会包含授权正常和异常的
      }
    }

    // 店铺多开使用 EndTime 字段，需要同时设置 time_state
    if (expiringFunctionCode.value === 'OPENSHOP') {
      baseData.filter.time_state = 2 // 即将到期（映射到 EndTime 字段）
    }

    // 获取第一页数据
    const res: any = await getShopFdmv(baseData)
    if (res?.code !== 200) {
      expiringShopListAll.value = []
      expiringShopTotal.value = 0
      expiringShopList.value = []
      return
    }

    const shops = res.data?.rows || []
    const total = res.data?.total || 0

    // 处理第一页数据
    const allShops: any[] = processShopsData(shops)

    // 如果数据量超过 MAX_PAGE_SIZE，需要分页获取所有数据
    if (total > MAX_PAGE_SIZE) {
      const totalPages = Math.ceil(total / MAX_PAGE_SIZE)

      // 并行获取剩余页面的数据（限制并发数，避免过多请求）
      const pagePromises: Promise<any>[] = []
      for (let page = 2; page <= totalPages; page++) {
        const pageData = {
          ...baseData,
          page,
          pageSize: MAX_PAGE_SIZE
        }
        pagePromises.push(getShopFdmv(pageData))
      }

      // 等待所有请求完成
      const pageResults = await Promise.all(pagePromises)

      // 处理所有页面的数据
      pageResults.forEach((pageRes: any) => {
        if (pageRes?.code === 200 && pageRes.data?.rows) {
          allShops.push(...processShopsData(pageRes.data.rows))
        }
      })
    }

    // 对所有店铺进行排序
    sortExpiringShops(allShops)
    expiringShopListAll.value = allShops
    expiringShopTotal.value = total

    // 记录已加载的功能代码
    lastLoadedFunctionCode.value = expiringFunctionCode.value

    // 更新当前页显示的数据
    updateExpiringShopListPage()
  } catch (error) {
    console.error('获取即将到期店铺失败:', error)
    expiringShopListAll.value = []
    expiringShopTotal.value = 0
    expiringShopList.value = []
    lastLoadedFunctionCode.value = null
  } finally {
    expiringLoading.value = false
    isGettingExpiringShops.value = false
  }
}

/**
 * 对即将到期的店铺列表进行排序（按剩余时间从短到长）
 */
const sortExpiringShops = (shops: any[]) => {
  shops.sort((a: any, b: any) => {
    if (!expiringFunctionCode.value) return 0

    // 获取到期时间（优先使用展平后的字段，否则从 func_info 中获取）
    const getEndTime = (shop: any): string | null => {
      // 方法1：优先使用展平后的字段（更高效）
      const timeField = `${expiringFunctionCode.value}time`
      if (shop[timeField] && shop[timeField] !== '已到期') {
        return shop[timeField]
      }

      // 方法2：从 func_info 或 extra_data?.func_enable 中获取
      const func = getShopFunctionInfo(shop, expiringFunctionCode.value)
      return func?.end_time || null
    }

    const endTimeA = getEndTime(a)
    const endTimeB = getEndTime(b)

    // 计算剩余天数
    const daysA = endTimeA ? calculateRemainingDays(endTimeA) : null
    const daysB = endTimeB ? calculateRemainingDays(endTimeB) : null

    // 处理 null 值：没有到期时间的排在最后
    if (daysA === null && daysB === null) return 0
    if (daysA === null) return 1
    if (daysB === null) return -1

    // 按照剩余天数升序排序（剩余时间越短越靠前）
    return daysA - daysB
  })
}

/**
 * 更新当前页显示的店铺列表（基于已排序的所有数据）
 */
const updateExpiringShopListPage = (): void => {
  const start = (expiringShopPage.value - 1) * expiringShopPageSize.value
  const end = start + expiringShopPageSize.value
  expiringShopList.value = expiringShopListAll.value.slice(start, end)
}

/**
 * 获取即将到期的店铺列表（兼容旧接口，现在使用前端分页）
 * @param page 页码
 * @param pageSize 每页数量
 */
const getExpiringShops = async (
  page: number = expiringShopPage.value,
  pageSize: number = expiringShopPageSize.value
): Promise<void> => {
  // 如果还没有加载所有数据，先加载
  if (expiringShopListAll.value.length === 0 && expiringShopTotal.value === 0) {
    await getAllExpiringShops()
  } else {
    // 如果只是翻页，更新当前页数据
    expiringShopPage.value = page
    expiringShopPageSize.value = pageSize
    updateExpiringShopListPage()
  }
}

// 获取授权异常的店铺数量（使用分页获取总数）
const getAuthErrorShopCount = async () => {
  try {
    const data = {
      page: 1,
      pageSize: COUNT_PAGE_SIZE,
      filter: {
        shopType: currentShopType.value,
        state: AUTH_ERROR_STATE
      }
    }

    const res: any = await getShopFdmv(data)
    authErrorShopCount.value = res?.code === 200 ? res.data?.total || 0 : 0
  } catch (error) {
    console.error('获取授权异常店铺数量失败:', error)
    authErrorShopCount.value = 0
  }
}

// 获取授权异常的店铺列表（分页加载）
const getAuthErrorShops = async (
  page: number = authErrorShopPage.value,
  pageSize: number = authErrorShopPageSize.value
) => {
  try {
    authErrorLoading.value = true
    const data = {
      page,
      pageSize,
      filter: {
        shopType: currentShopType.value,
        state: AUTH_ERROR_STATE
      }
    }

    const res: any = await getShopFdmv(data)
    if (res?.code === 200) {
      authErrorShopList.value = res.data?.rows || []
      authErrorShopTotal.value = res.data?.total || 0
    } else {
      authErrorShopList.value = []
      authErrorShopTotal.value = 0
    }
  } catch (error) {
    console.error('获取授权异常店铺失败:', error)
    authErrorShopList.value = []
    authErrorShopTotal.value = 0
  } finally {
    authErrorLoading.value = false
  }
}

// 初始化统计数据（只获取数量，不获取详细列表）
const initStatusCount = async () => {
  // 饿了么复制版只获取授权异常数量，不获取即将到期数量（因为没有功能）
  if (currentShopType.value === ShopType.饿了么官方) {
    await getAuthErrorShopCount()
  } else {
    await Promise.all([getExpiringShopCount(), getAuthErrorShopCount()])
  }
}

// 即将到期对话框相关
// 打开即将到期对话框
const openExpiringDialog = async () => {
  expiringShopPage.value = 1
  expiringShopPageSize.value = DEFAULT_PAGE_SIZE
  // 重新加载所有数据并排序
  await getAllExpiringShops()
  expiringDialogVisible.value = true
  selectedExpiringShops.value = []
}

// 关闭即将到期对话框
const closeExpiringDialog = () => {
  expiringDialogVisible.value = false
  selectedExpiringShops.value = []
  expiringShopPage.value = 1
  expiringShopPageSize.value = DEFAULT_PAGE_SIZE
  // 注意：不清空缓存数据，下次打开相同功能时可以直接使用
}

// 即将到期店铺分页变化
const handleExpiringPageChange = (page: number) => {
  expiringShopPage.value = page
  // 只更新当前页显示的数据，不需要重新请求
  updateExpiringShopListPage()
  // 切换页面时清空选中
  selectedExpiringShops.value = []
}

// 即将到期店铺每页数量变化
const handleExpiringPageSizeChange = (pageSize: number) => {
  expiringShopPageSize.value = pageSize
  expiringShopPage.value = 1
  // 只更新当前页显示的数据，不需要重新请求
  updateExpiringShopListPage()
  // 切换每页数量时清空选中
  selectedExpiringShops.value = []
}

// 处理即将到期店铺选择变化
const handleExpiringSelectionChange = (shops: any[]) => {
  selectedExpiringShops.value = shops
}

// 获取店铺的功能信息（提取公共逻辑）
const getShopFunctionInfo = (row: any, funcCode: string) => {
  // 优先使用 func_info，如果没有则使用 extra_data?.func_enable
  let funcSource = row.func_info
  if (!funcSource || !Array.isArray(funcSource) || funcSource.length === 0) {
    funcSource = row.extra_data?.func_enable
  }
  if (!Array.isArray(funcSource)) return null

  return funcSource.find((f: any) => f.code === funcCode) || null
}

// 计算剩余天数
const calculateRemainingDays = (endTime: string): number | null => {
  try {
    const endDate = new Date(endTime)
    if (isNaN(endDate.getTime())) return null

    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

// 获取店铺剩余天数（根据当前选择的功能代码）
const getExpiringTime = (row: any) => {
  if (!expiringFunctionCode.value) return '未知'

  const func = getShopFunctionInfo(row, expiringFunctionCode.value)
  if (!func || !func.end_time) return '未知'

  const diffDays = calculateRemainingDays(func.end_time)
  if (diffDays === null) return '未知'

  if (diffDays < 0) {
    return '已到期'
  } else if (diffDays === 0) {
    return '剩余0天'
  } else {
    return `剩余${diffDays}天`
  }
}

// 判断是否已到期（根据当前选择的功能代码）
const isExpired = (row: any) => {
  if (!expiringFunctionCode.value) return false

  const func = getShopFunctionInfo(row, expiringFunctionCode.value)
  if (!func || !func.end_time) return false

  const diffDays = calculateRemainingDays(func.end_time)
  return diffDays !== null && diffDays < 0
}

// 单个店铺续费
const renewSingleShop = (row: any) => {
  selectedShopsForRenew.value = [row]
  selectedFunctionCode.value = expiringFunctionCode.value
  selectedFunctionName.value = expiringFunctionName.value
  batchRenewDialogVisible.value = true
}

// 批量续费即将到期店铺
const batchRenewExpiringShops = () => {
  if (selectedExpiringShops.value.length === 0) {
    gp.$baseMessage('请选择要续费的店铺', 'warning', 'hey')
    return
  }
  selectedShopsForRenew.value = selectedExpiringShops.value
  selectedFunctionCode.value = expiringFunctionCode.value
  selectedFunctionName.value = expiringFunctionName.value
  batchRenewDialogVisible.value = true
}

// 授权异常对话框相关
// 打开授权异常对话框
const openAuthErrorDialog = async () => {
  authErrorShopPage.value = 1
  authErrorShopPageSize.value = DEFAULT_PAGE_SIZE
  await getAuthErrorShops(1, DEFAULT_PAGE_SIZE)
  authErrorDialogVisible.value = true
}

// 关闭授权异常对话框
const closeAuthErrorDialog = () => {
  authErrorDialogVisible.value = false
  authErrorShopPage.value = 1
  authErrorShopPageSize.value = DEFAULT_PAGE_SIZE
}

// 授权异常店铺分页变化
const handleAuthErrorPageChange = (page: number) => {
  authErrorShopPage.value = page
  getAuthErrorShops(page, authErrorShopPageSize.value)
}

// 授权异常店铺每页数量变化
const handleAuthErrorPageSizeChange = (pageSize: number) => {
  authErrorShopPageSize.value = pageSize
  authErrorShopPage.value = 1
  getAuthErrorShops(1, pageSize)
}

// 修复授权
const fixAuth = (row: any) => {
  if (fixingAuthIds.value.includes(row.id)) {
    return
  }

  fixingAuthIds.value.push(row.id)

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
        // 刷新授权异常列表（保持当前页）
        await getAuthErrorShops(authErrorShopPage.value, authErrorShopPageSize.value)
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

// 续费成功回调
const handleRenewSuccess = () => {
  // 退出批量续费模式
  batchRenewMode.value = false
  selectedShopsForRenew.value = []
  // 刷新店铺列表
  getShopList(queryParams, false)
  // 刷新统计数据
  initStatusCount()
  // 如果即将到期对话框打开，刷新列表（保持当前页）
  if (expiringDialogVisible.value) {
    // 清空缓存，强制重新加载数据
    lastLoadedFunctionCode.value = null
    expiringShopListAll.value = []
    expiringShopTotal.value = 0
    getExpiringShops(expiringShopPage.value, expiringShopPageSize.value)
    // 清空选中
    selectedExpiringShops.value = []
  }
}

// 监听功能代码变化，同步更新功能名称
watch(selectedFunctionCode, newCode => {
  const selectedOption = functionOptions.value.find(item => item.code === newCode)
  if (selectedOption) {
    selectedFunctionName.value = selectedOption.name
  }
})

/**
 * 监听店铺类型变化，更新统计数据
 */
watch(currentShopType, async (newType, oldType) => {
  // 只有在类型真正变化，且不是刷新时，才重新获取统计数据
  if (newType !== oldType && !isRefreshing) {
    await loadFunctionOptions()
    initStatusCount()
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
  targetGroupId.value = undefined
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

// 刷新事件处理函数
let refreshHandler: (() => void) | null = null

/**
 * 重置标志管理（使用和基础版相同的键，共享重置状态）
 */
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

/**
 * 重置所有筛选和搜索条件到初始状态
 */
const resetAllFilters = () => {
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
  queryParams.page = 1
  queryParams.pageSize = 20

  // 清除保存的状态
  const state = getShopTypeState(currentShopType.value)
  state.page = 1
  state.pageSize = 20
  state.filter = { ...queryParams.filter }

  // 清空当前店铺列表，确保刷新时重新加载
  shopList.value = []

  // 刷新列表（每次都重新请求接口）
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
  }, 1000)
}

/**
 * 在组件挂载之前订阅全局刷新事件（顶部刷新按钮）
 */
onBeforeMount(() => {
  const gp = (globalThis as any).$baseSub

  if (gp) {
    refreshHandler = () => resetAllFilters()
    gp('reload-router-view', refreshHandler)
  } else {
    // 备用方案：监听 window 自定义事件
    refreshHandler = () => resetAllFilters()
    window.addEventListener('reload-router-view', refreshHandler as any)
  }
})

/**
 * 组件卸载前取消订阅
 */
onBeforeUnmount(() => {
  if (refreshHandler) {
    const gp = (globalThis as any).$baseSub
    if (gp) {
      gp('reload-router-view', refreshHandler)
    } else {
      window.removeEventListener('reload-router-view', refreshHandler as any)
    }
  }
})

/**
 * 初始化时加载数据（仅首次挂载时执行）
 */
onMounted(async () => {
  // 从 sessionStorage 恢复店铺类型
  const savedShopType = getSavedShopType()
  if (savedShopType !== currentShopType.value) {
    currentShopType.value = savedShopType
  }

  // 保存初始店铺类型到 sessionStorage
  saveCurrentShopType(currentShopType.value)

  // 恢复当前店铺类型的状态
  restoreShopTypeState(currentShopType.value)

  if (!initializedShopTypes.value.has(currentShopType.value)) {
    getShopList(queryParams)
    initializedShopTypes.value.add(currentShopType.value)
  }

  // 加载功能列表（用于到期店铺筛选）
  // 注意：先加载功能列表，再获取统计数据，避免重复请求
  await loadFunctionOptions()
  // 初始化统计数据（在功能列表加载完成后再获取）
  initStatusCount()
})

/**
 * 组件激活时的处理逻辑
 */
/**
 * 组件激活时的处理逻辑
 */
/**
 * 组件激活时的处理逻辑
 */
onActivated(() => {
  // 检查是否正在执行重置操作
  const isResetting = getIsResetting()

  if (isResetting) {
    if (!initializedShopTypes.value.has(currentShopType.value)) {
      initializedShopTypes.value.add(currentShopType.value)
    }

    setTimeout(() => {
      if (getIsResetting()) {
        setIsResetting(false)
      }
    }, 2000)

    return
  }

  // 如果正在刷新或正在切换店铺类型，不执行任何操作
  if (isRefreshing || isChangingShopType) {
    return
  }

  // 从 sessionStorage 读取保存的店铺类型
  const sessionValue = sessionStorage.getItem('mtFeatureV2_currentShopType')
  const sessionShopType = sessionValue ? parseInt(sessionValue, 10) : null

  // 如果 sessionStorage 为空，说明是首次加载
  if (sessionShopType === null) {
    return
  }

  // 如果 sessionStorage 与 currentShopType 不一致，立即同步
  if (sessionShopType !== currentShopType.value) {
    // 临时设置 isRefreshing，防止 watch 触发
    isRefreshing = true

    // 立即同步 currentShopType
    currentShopType.value = sessionShopType as ShopType

    // 清空旧数据
    shopList.value = []

    // 立即重新加载功能列表
    loadFunctionOptions()

    // 重置 isRefreshing
    nextTick(() => {
      isRefreshing = false
    })

    return
  }

  // 检查是否是刷新重置操作（shopList 为空说明可能是刷新）
  const isRefreshReset = shopList.value.length === 0

  if (isRefreshReset) {
    // 不恢复筛选，保持重置后的状态
    restoreShopTypeState(currentShopType.value, true)

    // 清空 ShopTable 中的筛选状态
    if (shopTableRef.value && shopTableRef.value.resetFilterStates) {
      shopTableRef.value.resetFilterStates()
    }

    // ⚠️ 强制重新加载数据（即使已初始化）
    getShopList(queryParams)

    // 如果该店铺类型还未初始化，标记为已初始化
    if (!initializedShopTypes.value.has(currentShopType.value)) {
      initializedShopTypes.value.add(currentShopType.value)
      loadFunctionOptions()
      initStatusCount()
    }
  } else {
    // 正常恢复状态
    restoreShopTypeState(currentShopType.value, false)

    // 如果该店铺类型还未初始化，则加载数据
    if (!initializedShopTypes.value.has(currentShopType.value)) {
      getShopList(queryParams)
      initializedShopTypes.value.add(currentShopType.value)
      loadFunctionOptions()
      initStatusCount()
    }
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

  // 功能版状态卡片样式（与基础版一致）
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
        border: 0.5px solid #ffd591; // 边框尽量小

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

      .batch-renew-btn,
      .confirm-renew-btn,
      .confirm-execute-btn,
      .execute-func-btn {
        flex-shrink: 0;
        border-width: 0.5px !important; // 边框尽量小
      }

      &.danger .status-number {
        color: #ff4d4f;
      }

      .status-unit {
        color: #999;
      }

      .function-select {
        width: 150px !important; // 加宽 50%（原 100px）
        min-width: 150px !important;
        flex-shrink: 0;

        :deep(.el-input__wrapper) {
          padding: 0 8px !important;
          background-color: transparent !important;
          box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08) !important; // 边框尽量小
          border: none !important;
          width: 100% !important;
        }

        :deep(.el-input__inner) {
          font-size: 12px !important;
          color: inherit;
          text-align: left;
          padding: 0 !important;
        }

        :deep(.el-select__caret) {
          color: inherit;
          font-size: 12px !important;
        }
      }

      .view-button {
        margin-left: auto;
        padding: 0 8px;
        height: 24px;
        font-size: 12px;
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

  .expired-text {
    color: #f56c6c;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .shop-type-nav {
    flex-direction: column;
    align-items: stretch;
    margin-top: 0;
    row-gap: 12px;

    .shop-type-list {
      width: 100%;
    }

    .shop-type-search {
      width: 100%;

      :deep(.el-input) {
        width: 100% !important;
      }
    }
  }

  .version-actions-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    row-gap: 12px;
    margin-bottom: 10px;

    .version-buttons {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;

      .version-button {
        width: 100%;
        margin-left: 0 !important;
        border-radius: 4px !important;
        border-right: 1px solid var(--el-border-color) !important;
      }

      .action-buttons {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;

        :deep(.el-button) {
          width: 100%;
          margin-left: 0 !important;
        }
      }
    }

    .recycle-btn {
      margin-left: 0;
      width: 100%;
    }

    > :deep(.el-button) {
      width: 100%;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    .operate-status-card {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .status-entry {
        flex-wrap: wrap;
        row-gap: 8px;
      }
    }
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
