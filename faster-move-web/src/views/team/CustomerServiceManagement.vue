<template>
  <div class="column-table-container no-background-container auto-height-container">
    <el-row v-loading="listLoading" :gutter="20">
      <el-col :span="24">
        <vab-card class="auto-height-card">
          <vab-query-form>
            <vab-query-form-top-panel :span="12">
              <el-form inline :model="queryForm" @submit.prevent>
                <el-form-item>
                  <el-input v-model="queryForm.word" clearable placeholder="请输入账号或手机号搜索"
                    @change="getCustomerServiceList" />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="avtagFilter" placeholder="请选择账号状态" @change="handleAvtagChange">
                    <el-option label="全部" value="all" />
                    <el-option label="启用" value="true" />
                    <el-option label="停用" value="false" />
                  </el-select>
                </el-form-item>
              </el-form>
            </vab-query-form-top-panel>
            <vab-query-form-left-panel :span="12" style="display: flex; justify-content: flex-end">
              <el-button :icon="Plus" type="primary" @click="handleAddCustomerService">添加客服</el-button>
            </vab-query-form-left-panel>
          </vab-query-form>

          <el-table :data="list">
            <el-table-column align="center" label="账号" prop="user_name" width="140" />
            <el-table-column align="center" label="手机号" prop="phone" width="140" />
            <el-table-column align="center" label="邀请码" prop="code" width="100" />
            <el-table-column align="center" label="备注" prop="notes" />
            <el-table-column align="center" label="剩余积分" prop="balance" sortable width="120" />
            <el-table-column align="center" label="账户状态" prop="avtag" width="100">
              <template #default="{ row }">
                <el-tag :type="row.avtag ? 'success' : 'danger'">
                  {{ row.avtag ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" prop="crtim" width="180" />
            <el-table-column fixed="right" label="操作" width="200px">
              <template #default="{ row }">
                <el-button type="text" @click="handleAssignShops(row)">分配店铺</el-button>
                <el-button type="text" style="color: #f56c6c;"
                  @click="handleRemoveCustomerService(row)">移除客服</el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty class="vab-data-empty" description="暂无客服数据" />
            </template>
          </el-table>

          <vab-pagination :current-page="queryForm.page" :page-size="queryForm.pageSize" :total="total"
            @current-change="handleCurrentChange" @size-change="handleSizeChange" />
        </vab-card>
      </el-col>
    </el-row>

    <!-- 添加客服抽屉 -->
    <el-drawer v-model="addCustomerServiceDrawerVisible" title="添加客服" size="55%" :destroy-on-close="true">
      <div class="add-customer-service-container">
        <el-form inline :model="memberQueryForm" @submit.prevent>
          <el-form-item>
            <el-input v-model="memberQueryForm.keyword" clearable placeholder="请输入账号或手机号搜索" @change="getMemberList"
              style="width: 260px;" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="memberQueryForm.avtag" placeholder="账号状态" clearable @change="getMemberList"
              style="width: 150px;">
              <el-option label="启用" :value="true" />
              <el-option label="停用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: auto;">
            <el-button @click="addCustomerServiceDrawerVisible = false">取消</el-button>
            <el-button type="primary" :loading="addLoading" @click="confirmAddCustomerService"
              :disabled="selectedMembers.length === 0">
              确定添加 (已选 {{ selectedMembers.length }} 个)
            </el-button>
          </el-form-item>
        </el-form>

        <el-table :data="memberList" v-loading="memberListLoading" @selection-change="handleMemberSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="账号" prop="user_name" />
          <el-table-column label="手机号" prop="phone" width="140" />
          <el-table-column label="邀请码" prop="code" width="100" />
          <el-table-column label="备注" prop="notes" show-overflow-tooltip />
          <el-table-column label="账户状态" prop="avtag" width="100">
            <template #default="{ row }">
              <el-tag :type="row.avtag ? 'success' : 'danger'">
                {{ row.avtag ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty class="vab-data-empty" description="暂无成员数据" />
          </template>
        </el-table>

        <vab-pagination :current-page="memberQueryForm.page" :page-size="memberQueryForm.pageSize" :total="memberTotal"
          @current-change="handleMemberPageChange" @size-change="handleMemberSizeChange" />
      </div>
    </el-drawer>

    <!-- 分配店铺抽屉 -->
    <el-drawer v-model="assignShopDrawerVisible" :title="`分配店铺 - ${currentCustomer?.user_name || ''}`" size="55%"
      :destroy-on-close="true">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 可分配的店铺 -->
        <el-tab-pane label="分配店铺" name="assign">
          <div class="assign-shop-container">
            <el-form inline :model="shopQueryForm" @submit.prevent>
              <el-form-item>
                <el-input v-model="shopQueryForm.keyword" clearable placeholder="请输入店铺名称搜索"
                  @change="getAvailableShopList" style="width: 260px;" />
              </el-form-item>
              <el-form-item>
                <el-select v-model="shopQueryForm.shopType" placeholder="店铺类型" clearable @change="getAvailableShopList"
                  style="width: 150px;">
                  <el-option label="美团" :value="1" />
                  <el-option label="饿了么" :value="2" />
                  <el-option label="美团闪购" :value="3" />
                  <el-option label="美团医药" :value="4" />
                  <el-option label="饿百零售" :value="5" />
                  <el-option label="京东到家" :value="6" />
                  <el-option label="抖店即时零售" :value="7" />
                  <el-option label="饿了么官方" :value="8" />
                </el-select>
              </el-form-item>
              <el-form-item style="margin-left: auto;">
                <el-button @click="assignShopDrawerVisible = false">取消</el-button>
                <el-button type="primary" :loading="assignLoading" :disabled="selectedShops.length === 0"
                  @click="confirmAssignShops">
                  确定分配 (已选 {{ selectedShops.length }} 个)
                </el-button>
              </el-form-item>
            </el-form>

            <el-table v-loading="shopListLoading" :data="availableShopList"
              @selection-change="handleShopSelectionChange" height="100%">
              <el-table-column type="selection" width="55" />
              <el-table-column label="店铺名称" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">
                  <vab-shop-info :shop-type="row.shop_type" :shop-name="row.name" :icon-size="14" />
                </template>
              </el-table-column>
              <el-table-column label="门店ID" prop="office_id" width="180" show-overflow-tooltip />
              <el-table-column label="城市" width="140">
                <template #default="{ row }">
                  {{ row.province }} {{ row.city }}
                </template>
              </el-table-column>
              <el-table-column label="分组" prop="group_name" width="140" show-overflow-tooltip />
              <template #empty>
                <el-empty description="暂无可分配的店铺" />
              </template>
            </el-table>

            <vab-pagination :current-page="shopQueryForm.page" :page-size="shopQueryForm.pageSize" :total="shopTotal"
              @current-change="handleShopPageChange" @size-change="handleShopSizeChange" />
          </div>
        </el-tab-pane>

        <!-- 已分配的店铺 -->
        <el-tab-pane label="已分配店铺" name="assigned">
          <div class="assigned-shop-container">
            <el-form inline>
              <el-form-item>
                <el-select v-model="assignedShopQueryForm.shopType" placeholder="店铺类型" clearable
                  @change="getAssignedShopList" style="width: 150px;">
                  <el-option label="美团" :value="1" />
                  <el-option label="饿了么" :value="2" />
                  <el-option label="美团闪购" :value="3" />
                  <el-option label="美团医药" :value="4" />
                  <el-option label="饿百零售" :value="5" />
                  <el-option label="京东到家" :value="6" />
                  <el-option label="抖店即时零售" :value="7" />
                  <el-option label="饿了么官方" :value="8" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="danger" :disabled="selectedAssignedShops.length === 0" :loading="unassignLoading"
                  @click="handleBatchUnassign">
                  批量取消分配 (已选 {{ selectedAssignedShops.length }} 个)
                </el-button>
              </el-form-item>
            </el-form>

            <el-table v-loading="assignedShopListLoading" :data="assignedShopList" height="100%"
              @selection-change="handleAssignedShopSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column label="店铺名称" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">
                  <vab-shop-info :shop-type="row.ShopType" :shop-name="row.ShopName" :icon-size="14" />
                </template>
              </el-table-column>
              <el-table-column label="门店ID" prop="ShopOfficeId" width="180" show-overflow-tooltip />
              <el-table-column label="城市" width="140">
                <template #default="{ row }">
                  {{ row.Province }} {{ row.City }}
                </template>
              </el-table-column>
              <el-table-column label="分组" prop="GroupName" width="140" show-overflow-tooltip />
              <el-table-column label="分配时间" prop="AssignedAt" width="180">
                <template #default="{ row }">
                  {{ row.AssignedAt ? new Date(row.AssignedAt).toLocaleString('zh-CN') : '-' }}
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无已分配的店铺" />
              </template>
            </el-table>

            <vab-pagination :current-page="assignedShopQueryForm.page" :page-size="assignedShopQueryForm.pageSize"
              :total="assignedShopTotal" @current-change="handleAssignedShopPageChange"
              @size-change="handleAssignedShopSizeChange" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab.ts'
import type { GetAdminListItemInfoVo } from '/@/TsModel/Alien/Controller/GetAdminListItemInfoVo'
import type { GetAdminListParmsVo } from '/@/TsModel/Alien/Controller/GetAdminListParmsVo'
import type { ShopList_ResulItem } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem'
import type { UserAssignedShopVo } from '/@/TsModel/Alien/Controllers/Shop/UserAssignedShopVo'
import type { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

defineOptions({
  name: 'CustomerServiceManagement',
})

const listLoading = ref<boolean>(true)
const list = ref<GetAdminListItemInfoVo[]>([])
const total = ref<number>(0)
const avtagFilter = ref<string>('all')

// 添加客服相关状态
const addCustomerServiceDrawerVisible = ref<boolean>(false)
const addLoading = ref<boolean>(false)
const memberListLoading = ref<boolean>(false)
const memberList = ref<GetAdminListItemInfoVo[]>([])
const memberTotal = ref<number>(0)
const selectedMembers = ref<GetAdminListItemInfoVo[]>([])

// 分配店铺相关状态
const assignShopDrawerVisible = ref<boolean>(false)
const currentCustomer = ref<GetAdminListItemInfoVo | null>(null)
const activeTab = ref<string>('assign')
const shopListLoading = ref<boolean>(false)
const assignedShopListLoading = ref<boolean>(false)
const assignLoading = ref<boolean>(false)
const unassignLoading = ref<boolean>(false)
const availableShopList = ref<ShopList_ResulItem[]>([])
const assignedShopList = ref<UserAssignedShopVo[]>([])
const selectedShops = ref<ShopList_ResulItem[]>([])
const selectedAssignedShops = ref<UserAssignedShopVo[]>([])
const shopTotal = ref<number>(0)
const assignedShopTotal = ref<number>(0)

const queryForm = reactive<GetAdminListParmsVo>({
  page: 1,
  pageSize: 20,
  word: '',
  avtag: null,
  role: 'KEFU', // 固定查询客服角色
  userType: 1,
})

// 成员列表查询表单
const memberQueryForm = reactive<GetAdminListParmsVo>({
  page: 1,
  pageSize: 20,
  keyword: '',
  avtag: undefined,
  role: undefined, // 不限定角色
  userType: 1,
})

// 店铺查询表单
const shopQueryForm = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  shopType: 1, // 默认选择美团
})

// 已分配店铺查询表单
const assignedShopQueryForm = reactive({
  page: 1,
  pageSize: 20,
  shopType: undefined as ShopType | undefined,
})

/**
 * 处理账号状态筛选变化
 */
const handleAvtagChange = () => {
  // 根据 avtagFilter 的值设置 queryForm.avtag
  if (avtagFilter.value === 'all') {
    queryForm.avtag = null
  } else if (avtagFilter.value === 'true') {
    queryForm.avtag = true
  } else if (avtagFilter.value === 'false') {
    queryForm.avtag = false
  }
  getCustomerServiceList()
}

/**
 * 获取客服列表
 */
const getCustomerServiceList = async () => {
  listLoading.value = true
  try {
    const result = await apiManager.adminGroupApi.GetAdminList(queryForm)
    list.value = result?.rows || []
    total.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取客服列表失败', 'error', 'hey')
    list.value = []
    total.value = 0
  } finally {
    listLoading.value = false
  }
}

/**
 * 获取成员列表（用于添加客服）
 */
const getMemberList = async () => {
  memberListLoading.value = true
  try {
    const result = await apiManager.adminGroupApi.GetAdminList({
      page: memberQueryForm.page,
      pageSize: memberQueryForm.pageSize,
      word: memberQueryForm.keyword || undefined,
      avtag: memberQueryForm.avtag,
      role: undefined, // 不限定角色
      userType: 1,
    })
    memberList.value = result?.rows || []
    memberTotal.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取成员列表失败', 'error', 'hey')
    memberList.value = []
    memberTotal.value = 0
  } finally {
    memberListLoading.value = false
  }
}

/**
 * 处理成员选择变化
 */
const handleMemberSelectionChange = (selection: GetAdminListItemInfoVo[]) => {
  selectedMembers.value = selection
}

/**
 * 处理添加客服
 */
const handleAddCustomerService = () => {
  addCustomerServiceDrawerVisible.value = true
  memberQueryForm.page = 1
  memberQueryForm.keyword = ''
  memberQueryForm.avtag = undefined
  selectedMembers.value = []
  getMemberList()
}

/**
 * 确认添加客服
 */
const confirmAddCustomerService = async () => {
  if (selectedMembers.value.length === 0) {
    gp.$baseMessage('请至少选择一个成员', 'warning', 'hey')
    return
  }

  addLoading.value = true
  try {
    // 批量为选中的成员设置客服角色
    await apiManager.adminApi.SetSubordinateRoles({
      UserIds: selectedMembers.value.map((member) => member.id),
      Role: 'KEFU',
    })

    gp.$baseMessage(
      `成功为 ${selectedMembers.value.length} 个成员设置客服角色`,
      'success',
      'hey'
    )
    addCustomerServiceDrawerVisible.value = false
    await getCustomerServiceList()
  } catch (error: any) {
    gp.$baseMessage(error?.message || '添加客服失败', 'error', 'hey')
  } finally {
    addLoading.value = false
  }
}

/**
 * 成员列表页码改变
 */
const handleMemberPageChange = (value: number) => {
  memberQueryForm.page = value
  getMemberList()
}

/**
 * 成员列表每页大小改变
 */
const handleMemberSizeChange = (value: number) => {
  memberQueryForm.pageSize = value
  memberQueryForm.page = 1
  getMemberList()
}

/**
 * 移除客服角色
 */
const handleRemoveCustomerService = async (row: GetAdminListItemInfoVo) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除"${row.user_name}"的客服角色吗？移除后该用户将无法使用客服功能。`,
      '移除客服确认',
      {
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 移除客服角色（批量操作接口）
    await apiManager.adminApi.RemoveSubordinateRoles({
      UserIds: [row.id],
      Role: 'KEFU',
    })

    gp.$baseMessage('移除客服成功', 'success', 'hey')
    await getCustomerServiceList()
  } catch (error: any) {
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '移除客服失败', 'error', 'hey')
    }
  }
}

/**
 * 打开分配店铺抽屉
 */
const handleAssignShops = (row: GetAdminListItemInfoVo) => {
  currentCustomer.value = row
  assignShopDrawerVisible.value = true
  activeTab.value = 'assign'
  shopQueryForm.page = 1
  shopQueryForm.keyword = ''
  shopQueryForm.shopType = 1 // 默认选择美团
  selectedShops.value = []
  getAvailableShopList()
}

/**
 * 选项卡切换
 */
const handleTabChange = (tabName: string | number) => {
  if (tabName === 'assigned') {
    assignedShopQueryForm.page = 1
    assignedShopQueryForm.shopType = undefined
    getAssignedShopList()
  }
}

/**
 * 获取可分配的店铺列表
 */
const getAvailableShopList = async () => {
  if (!currentCustomer.value) return

  shopListLoading.value = true
  try {
    const result = await apiManager.shopmgApi.GetShopList({
      page: shopQueryForm.page,
      pageSize: shopQueryForm.pageSize,
      filter: {
        shopType: shopQueryForm.shopType,
        word: shopQueryForm.keyword || undefined,
      },
    })
    availableShopList.value = result?.rows || []
    shopTotal.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取店铺列表失败', 'error', 'hey')
    availableShopList.value = []
    shopTotal.value = 0
  } finally {
    shopListLoading.value = false
  }
}

/**
 * 获取已分配的店铺列表
 */
const getAssignedShopList = async () => {
  if (!currentCustomer.value) return

  assignedShopListLoading.value = true
  try {
    const result = await apiManager.shopmgApi.GetUserAssignedShops(
      currentCustomer.value.id,
      assignedShopQueryForm.page,
      assignedShopQueryForm.pageSize,
      assignedShopQueryForm.shopType
    )
    assignedShopList.value = result?.rows || []
    assignedShopTotal.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取已分配店铺列表失败', 'error', 'hey')
    assignedShopList.value = []
    assignedShopTotal.value = 0
  } finally {
    assignedShopListLoading.value = false
  }
}

/**
 * 处理店铺选择变化
 */
const handleShopSelectionChange = (selection: ShopList_ResulItem[]) => {
  selectedShops.value = selection
}

/**
 * 确认分配店铺
 */
const confirmAssignShops = async () => {
  if (!currentCustomer.value || selectedShops.value.length === 0) {
    return
  }

  assignLoading.value = true
  try {
    const result = await apiManager.shopmgApi.BatchAssignShopsToUser({
      UserId: currentCustomer.value.id,
      ShopIds: selectedShops.value.map(shop => shop.id),
    })

    gp.$baseMessage(
      `成功为 ${result.TargetUserName} 分配了 ${result.SuccessCount} 个店铺`,
      'success',
      'hey'
    )

    // 清空已选择的店铺
    selectedShops.value = []
    // 刷新店铺列表
    await getAvailableShopList()
    // 切换到已分配选项卡查看结果
    activeTab.value = 'assigned'
    await getAssignedShopList()
  } catch (error: any) {
    gp.$baseMessage(error?.message || '分配店铺失败', 'error', 'hey')
  } finally {
    assignLoading.value = false
  }
}

/**
 * 处理已分配店铺选择变化
 */
const handleAssignedShopSelectionChange = (selection: UserAssignedShopVo[]) => {
  selectedAssignedShops.value = selection
}

/**
 * 批量取消分配店铺
 */
const handleBatchUnassign = async () => {
  if (!currentCustomer.value || selectedAssignedShops.value.length === 0) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消 ${currentCustomer.value.user_name} 对已选 ${selectedAssignedShops.value.length} 个店铺的管理权限吗？`,
      '批量取消分配确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    unassignLoading.value = true
    const result = await apiManager.shopmgApi.BatchUnassignShopsFromUser({
      UserId: currentCustomer.value.id,
      ShopIds: selectedAssignedShops.value.map(shop => shop.ShopId),
    })

    gp.$baseMessage(
      `成功取消 ${result.TargetUserName} 对 ${result.SuccessCount} 个店铺的管理权限`,
      'success',
      'hey'
    )

    // 清空已选择的店铺
    selectedAssignedShops.value = []
    // 刷新已分配店铺列表
    await getAssignedShopList()
  } catch (error: any) {
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '取消分配失败', 'error', 'hey')
    }
  } finally {
    unassignLoading.value = false
  }
}

/**
 * 获取店铺类型名称
 */
const getShopTypeName = (type: number) => {
  const typeMap: Record<number, string> = {
    1: '美团',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售',
    8: '饿了么官方',
  }
  return typeMap[type] || '未知'
}

/**
 * 店铺列表分页大小改变
 */
const handleShopSizeChange = (value: number) => {
  shopQueryForm.page = 1
  shopQueryForm.pageSize = value
  getAvailableShopList()
}

/**
 * 店铺列表当前页改变
 */
const handleShopPageChange = (value: number) => {
  shopQueryForm.page = value
  getAvailableShopList()
}

/**
 * 已分配店铺列表分页大小改变
 */
const handleAssignedShopSizeChange = (value: number) => {
  assignedShopQueryForm.page = 1
  assignedShopQueryForm.pageSize = value
  getAssignedShopList()
}

/**
 * 已分配店铺列表当前页改变
 */
const handleAssignedShopPageChange = (value: number) => {
  assignedShopQueryForm.page = value
  getAssignedShopList()
}

/**
 * 分页大小改变
 */
const handleSizeChange = (value: number) => {
  queryForm.page = 1
  queryForm.pageSize = value
  getCustomerServiceList()
}

/**
 * 当前页改变
 */
const handleCurrentChange = (value: number) => {
  queryForm.page = value
  getCustomerServiceList()
}

// 初始化加载数据
getCustomerServiceList()
</script>

<style lang="scss" scoped>
// 添加客服抽屉样式
.add-customer-service-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  overflow: hidden;
  gap: 16px;

  .el-form {
    grid-row: 1;
  }

  :deep(.el-table) {
    grid-row: 2;
    height: 100%;
    overflow: hidden;
  }

  .vab-pagination {
    grid-row: 3;
  }
}

// 分配店铺抽屉样式
:deep(.el-drawer__body) {
  padding: 16px !important;
  height: calc(100vh - 80px) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

:deep(.el-tabs) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  height: 100% !important;
}

:deep(.el-tabs__header) {
  margin: 0 0 16px 0 !important;
  flex: none !important;
  order: -1 !important;
}

:deep(.el-tabs__content) {
  flex: 1 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.el-tab-pane) {
  flex: 1 !important;
  overflow: hidden !important;
  flex-direction: column !important;

  &[style*="display: none"] {
    display: none !important;
  }

  &:not([style*="display: none"]) {
    display: flex !important;
  }
}

.assign-shop-container,
.assigned-shop-container {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;

  :deep(.el-form) {
    flex: none !important;
    margin-bottom: 16px !important;
  }

  :deep(.el-table) {
    flex: 1 !important;
    overflow: auto !important;
  }

  :deep(.vab-pagination) {
    flex: none !important;
    margin-top: 16px !important;
  }
}
</style>