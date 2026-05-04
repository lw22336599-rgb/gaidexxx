<template>
  <div class="column-table-container no-background-container auto-height-container">
    <el-row v-loading="listLoading" :gutter="20">
      <el-col :span="24">
        <vab-card class="auto-height-card">
          <vab-query-form>
            <vab-query-form-top-panel :span="24">
              <el-form inline :model="queryForm" @submit.prevent>
                <el-form-item>
                  <el-button :icon="Plus" type="primary" @click="handleAddCustomerService">设置客服</el-button>
                </el-form-item>
                <el-form-item>
                  <el-input
                    v-model="queryForm.word"
                    clearable
                    placeholder="请输入账号或手机号搜索"
                    @change="getCustomerServiceList"
                  />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="avtagFilter" placeholder="请选择账号状态" @change="handleAvtagChange">
                    <el-option label="全部" value="all" />
                    <el-option label="启用" value="true" />
                    <el-option label="停用" value="false" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-divider direction="vertical" style="height: 32px; margin: 0 16px" />
                  <span style="margin-right: 8px; color: var(--el-text-color-regular)">控制下级开启IM客服</span>
                  <el-tooltip
                    content="开启后,下级必须由您分配客服角色后才能使用IM客服功能;关闭后,下级可以自主开启IM客服功能"
                    placement="top"
                  >
                    <el-icon style="margin-right: 8px; cursor: help; color: var(--el-text-color-secondary)">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                  <el-switch
                    v-model="imConfig.no_auto_kefu"
                    :loading="imConfigLoading"
                    active-text="仅限分配"
                    inactive-text="允许自主"
                    @change="handleImConfigChange"
                  />
                </el-form-item>
              </el-form>
            </vab-query-form-top-panel>
          </vab-query-form>

          <div style="margin: 16px 0; font-size: 16px; font-weight: 500; color: #303133">
            客服列表 <span :class="{ 'blur-text': demoMode }">({{ total }})</span>
          </div>

          <el-table :data="list">
            <el-table-column align="center" label="账号" prop="user_name" min-width="120">
              <template #default="{ row }">
                <span :class="{ 'blur-text': demoMode }">{{ row.user_name }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="手机号" prop="phone" min-width="130">
              <template #default="{ row }">
                <span :class="{ 'blur-text': demoMode }">{{ row.phone }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="邀请码" prop="code" min-width="100">
              <template #default="{ row }">
                <span :class="{ 'blur-text': demoMode }">{{ row.code }}</span>
              </template>
            </el-table-column>
            <!-- 备注列：文本靠左，编辑图标在右侧 -->
            <el-table-column label="备注" min-width="150">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: flex-start">
                  <span
                    :class="{ 'blur-text': demoMode }"
                    style="text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
                  >
                    {{ filterNotes(row.notes) }}
                  </span>
                  <el-icon
                    class="edit-icon"
                    style="cursor: pointer; color: #409eff; flex-shrink: 0; margin-left: 2px"
                    @click="handleEditNotes(row)"
                  >
                    <EditPen />
                  </el-icon>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="剩余积分" prop="balance" sortable min-width="110">
              <template #default="{ row }">
                <span :class="{ 'blur-text': demoMode }">{{ formatBalance(row.balance) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="账户状态" prop="avtag" min-width="100">
              <template #default="{ row }">
                <el-tag :type="row.avtag ? 'success' : 'danger'">
                  {{ row.avtag ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" prop="crtim" min-width="160">
              <template #default="{ row }">
                <span :class="{ 'blur-text': demoMode }">{{ row.crtim || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200px">
              <template #default="{ row }">
                <el-button type="text" @click="handleAssignShops(row)">分配店铺</el-button>
                <el-button type="text" style="color: #f56c6c" @click="handleRemoveCustomerService(row)"
                  >移除客服</el-button
                >
              </template>
            </el-table-column>
            <template #empty>
              <el-empty class="vab-data-empty" description="暂无客服数据" />
            </template>
          </el-table>

          <vab-pagination
            :current-page="queryForm.page"
            :page-size="queryForm.pageSize"
            :total="total"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </vab-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑分组对话框 -->
    <el-dialog
      v-model="adminDioal"
      :destroy-on-close="true"
      :title="currentForm.id ? '编辑分组' : '添加分组'"
      width="500px"
    >
      <div class="jifenbox">
        <el-form
          ref="ruleFormRefAdmin"
          class="demo-ruleForm"
          label-width="100"
          :model="currentForm"
          :rules="adminRules"
        >
          <el-form-item label="分组名称" prop="name">
            <el-input v-model="currentForm.name" />
          </el-form-item>
          <el-form-item label="分组描述" prop="notes">
            <el-input v-model="currentForm.notes" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="sumAdmin">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!-- 编辑备注对话框 -->
    <el-dialog v-model="editNotesDialogVisible" title="编辑备注" width="500px" :destroy-on-close="true">
      <el-form :model="editNotesForm">
        <el-form-item label="备注信息">
          <el-input v-model="editNotesForm.notes" placeholder="请输入备注信息" :rows="3" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editNotesDialogVisible = false">取消</el-button>
          <el-button :loading="editNotesLoading" type="primary" @click="confirmEditNotes">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加员工对话框 -->
    <el-dialog v-model="addEmployeeDialogVisible" title="新增客服" width="500px" :destroy-on-close="true">
      <el-form ref="employeeFormRef" :model="employeeParams" :rules="employeeRule">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="employeeParams.phone" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="addEmployeeLoading" type="primary" @click="confirmAddEmployee">确 定</el-button>
          <el-button @click="addEmployeeDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!--设置客服抽屉 -->
    <el-drawer v-model="addCustomerServiceDrawerVisible" title="设置客服" size="55%" :destroy-on-close="true">
      <div class="add-customer-service-container">
        <el-form inline :model="memberQueryForm" @submit.prevent>
          <el-form-item>
            <el-input
              v-model="memberQueryForm.word"
              clearable
              placeholder="请输入账号或手机号搜索"
              style="width: 260px"
              @change="getMemberList"
            />
          </el-form-item>
          <el-form-item>
            <el-select
              :model-value="memberQueryForm.avtag ?? undefined"
              placeholder="账号状态"
              clearable
              style="width: 150px"
              @update:model-value="
                (val: boolean | undefined) => {
                  memberQueryForm.avtag = val
                  getMemberList()
                }
              "
            >
              <el-option label="启用" :value="true" />
              <el-option label="停用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item style="margin-left: auto">
            <el-button @click="addCustomerServiceDrawerVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="addLoading"
              :disabled="selectedMembers.length === 0"
              @click="confirmAddCustomerService"
            >
              确定添加 (已选 {{ selectedMembers.length }} 个)
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="memberListLoading" :data="memberList" @selection-change="handleMemberSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="账号" prop="user_name">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.user_name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="手机号" prop="phone" width="140">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.phone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="邀请码" prop="code" width="100">
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="notes" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'blur-text': demoMode }">{{ row.notes }}</span>
            </template>
          </el-table-column>
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

        <vab-pagination
          :current-page="memberQueryForm.page"
          :page-size="memberQueryForm.pageSize"
          :total="memberTotal"
          @current-change="handleMemberPageChange"
          @size-change="handleMemberSizeChange"
        />
      </div>
    </el-drawer>

    <!-- 分配店铺抽屉 -->
    <el-drawer
      v-model="assignShopDrawerVisible"
      :title="`分配店铺 - ${demoMode ? '***' : currentCustomer?.user_name || ''}`"
      size="70%"
      :destroy-on-close="true"
    >
      <div class="assign-shop-container">
        <!-- 店铺类型按钮组 -->
        <div class="shop-type-buttons">
          <el-button-group>
            <el-button
              v-for="type in shopTypeOptions"
              :key="type.value"
              :type="shopQueryForm.shopType === type.value ? 'primary' : 'default'"
              @click="handleShopTypeChange(type.value)"
            >
              <vab-icon :icon="type.icon" is-custom-svg style="margin-right: 4px" />
              {{ type.label }}
            </el-button>
          </el-button-group>
        </div>

        <!-- 操作按钮 -->
        <div class="shop-actions">
          <div class="action-buttons">
            <el-button @click="assignShopDrawerVisible = false">取消</el-button>
          </div>
        </div>

        <!-- 双栏穿梭框 -->
        <div class="transfer-wrapper">
          <div class="transfer-panels">
            <!-- 左侧：未分配店铺 -->
            <div class="transfer-panel">
              <div class="transfer-panel-header">
                <div class="panel-title-wrapper">
                  <span class="panel-title"
                    >未分配店铺 <span :class="{ 'blur-text': demoMode }">({{ shopTotal }})</span></span
                  >
                </div>
                <el-input
                  v-model="shopQueryForm.keyword"
                  clearable
                  placeholder="请输入店铺名称搜索"
                  style="width: 200px"
                  @change="handleShopSearch"
                />
              </div>
              <div v-loading="shopListLoading" class="transfer-panel-body">
                <el-table
                  :data="availableShopList"
                  height="100%"
                  @selection-change="handleAvailableShopSelectionChange"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column label="店铺名称" min-width="180">
                    <template #default="{ row }">
                      <vab-shop-info
                        :shop-type="row.ShopType"
                        :shop-name="row.ShopName"
                        :icon-size="16"
                        :class="{ 'blur-text': demoMode }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="门店ID" prop="ShopOfficeId" width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span :class="{ 'blur-text': demoMode }">{{ row.ShopOfficeId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="分组" prop="GroupName" width="120" show-overflow-tooltip />
                </el-table>
              </div>
              <div class="transfer-panel-footer">
                <div class="custom-pagination">
                  <el-button
                    :disabled="shopQueryForm.page <= 1"
                    @click="handleAvailableShopPageChange(shopQueryForm.page - 1)"
                  >
                    上一页
                  </el-button>
                  <el-select
                    v-model="shopQueryForm.pageSize"
                    style="width: 120px; margin: 0 12px"
                    @change="handleAvailableShopSizeChange"
                  >
                    <el-option label="10条/页" :value="10" />
                    <el-option label="20条/页" :value="20" />
                    <el-option label="50条/页" :value="50" />
                    <el-option label="100条/页" :value="100" />
                  </el-select>
                  <el-button
                    :disabled="shopQueryForm.page >= Math.ceil(shopTotal / shopQueryForm.pageSize)"
                    @click="handleAvailableShopPageChange(shopQueryForm.page + 1)"
                  >
                    下一页
                  </el-button>
                  <div style="margin-left: auto; display: flex; align-items: center">
                    <span style="margin: 0 12px">前往</span>
                    <el-input-number
                      v-model="shopQueryForm.page"
                      :min="1"
                      :max="Math.ceil(shopTotal / shopQueryForm.pageSize) || 1"
                      style="width: 100px"
                      @change="(val: number | undefined) => val && handleAvailableShopPageChange(val)"
                    />
                    <span style="margin-left: 8px">页</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 中间：操作按钮 -->
            <div class="transfer-buttons">
              <el-button type="primary" :disabled="selectedAvailableShops.length === 0" @click="handleMoveToRight">
                &gt;&gt;
              </el-button>
              <el-button type="primary" :disabled="selectedAssignedShops.length === 0" @click="handleMoveToLeft">
                &lt;&lt;
              </el-button>
            </div>

            <!-- 右侧：已分配店铺 -->
            <div class="transfer-panel">
              <div class="transfer-panel-header">
                <div class="panel-title-wrapper">
                  <span class="panel-title"
                    >已分配店铺 <span :class="{ 'blur-text': demoMode }">({{ assignedShopTotal }})</span></span
                  >
                </div>
              </div>
              <div v-loading="assignedShopListLoading" class="transfer-panel-body">
                <el-table :data="assignedShopList" height="100%" @selection-change="handleAssignedShopSelectionChange">
                  <el-table-column type="selection" width="55" />
                  <el-table-column label="店铺名称" min-width="180">
                    <template #default="{ row }">
                      <vab-shop-info
                        :shop-type="row.ShopType"
                        :shop-name="row.ShopName"
                        :icon-size="16"
                        :class="{ 'blur-text': demoMode }"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="门店ID" prop="ShopOfficeId" width="150" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span :class="{ 'blur-text': demoMode }">{{ row.ShopOfficeId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="分组" prop="GroupName" width="120" show-overflow-tooltip />
                </el-table>
              </div>
              <div class="transfer-panel-footer">
                <div class="custom-pagination">
                  <el-button
                    :disabled="assignedShopQueryForm.page <= 1"
                    @click="handleAssignedShopPageChange(assignedShopQueryForm.page - 1)"
                  >
                    上一页
                  </el-button>
                  <el-select
                    v-model="assignedShopQueryForm.pageSize"
                    style="width: 120px; margin: 0 12px"
                    @change="handleAssignedShopSizeChange"
                  >
                    <el-option label="10条/页" :value="10" />
                    <el-option label="20条/页" :value="20" />
                    <el-option label="50条/页" :value="50" />
                    <el-option label="100条/页" :value="100" />
                  </el-select>
                  <el-button
                    :disabled="
                      assignedShopQueryForm.page >= Math.ceil(assignedShopTotal / assignedShopQueryForm.pageSize)
                    "
                    @click="handleAssignedShopPageChange(assignedShopQueryForm.page + 1)"
                  >
                    下一页
                  </el-button>
                  <div style="margin-left: auto; display: flex; align-items: center">
                    <span style="margin: 0 12px">前往</span>
                    <el-input-number
                      v-model="assignedShopQueryForm.page"
                      :min="1"
                      :max="Math.ceil(assignedShopTotal / assignedShopQueryForm.pageSize) || 1"
                      style="width: 100px"
                      @change="(val: number | undefined) => val && handleAssignedShopPageChange(val)"
                    />
                    <span style="margin-left: 8px">页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { Plus, EditPen, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { FormInstance, TableInstance } from 'element-plus'
import { getGroup } from '/@/api/shop.ts'
import { addUser, addGroup, updateGroup, delGroup, updateAgency } from '/@/api/group.ts'
import { isPhone } from '/@/utils/validate.ts'
import { translate } from '/@/i18n'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab.ts'
import type { GetAdminListItemInfoVo } from '/@/TsModel/Alien/Controller/GetAdminListItemInfoVo'
import type { GetAdminListParmsVo } from '/@/TsModel/Alien/Controller/GetAdminListParmsVo'
import type { ShopList_ResulItem } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem'
import type { UserAssignedShopVo } from '/@/TsModel/Alien/Controllers/Shop/UserAssignedShopVo'
import type { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { Filter_FuncState } from '/@/TsModel/Alien/Controllers/Shop/Filter_FuncState'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import type { ImUserConfigVo } from '/@/TsModel/Alien/Faster/Controllers/IM/ImUserConfigVo'

defineOptions({
  name: 'CustomerServiceManagement1'
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// IM配置相关状态
const imConfig = ref<ImUserConfigVo>({
  no_auto_kefu: false
})
const imConfigLoading = ref<boolean>(false)

const listLoading = ref<boolean>(true)
const list = ref<GetAdminListItemInfoVo[]>([])
const total = ref<number>(0)
const avtagFilter = ref<string>('all')
const currentIndex = ref<number>(0)
const groupList = ref<any[]>([])
const adminDioal = ref<boolean>(false)
const ruleFormRefAdmin = ref<FormInstance>()
const btnLoading = ref<boolean>(false)
let currentForm = reactive<{
  id?: string
  type: number
  name: string
  notes: string
}>({
  type: 2,
  name: '',
  notes: ''
})

// 设置客服相关状态
const addCustomerServiceDrawerVisible = ref<boolean>(false)
const addLoading = ref<boolean>(false)
const memberListLoading = ref<boolean>(false)
const memberList = ref<GetAdminListItemInfoVo[]>([])
const memberTotal = ref<number>(0)
const selectedMembers = ref<GetAdminListItemInfoVo[]>([])

// 新增客服相关状态
const addEmployeeDialogVisible = ref<boolean>(false)
const addEmployeeLoading = ref<boolean>(false)
const employeeFormRef = ref<FormInstance>()
const employeeParams = reactive({
  phone: '',
  is_boss: false
})

// 编辑备注相关状态
const editNotesDialogVisible = ref<boolean>(false)
const editNotesLoading = ref<boolean>(false)
const editNotesForm = reactive({
  id: '',
  notes: ''
})

// 分配店铺相关状态
const assignShopDrawerVisible = ref<boolean>(false)
const currentCustomer = ref<GetAdminListItemInfoVo | null>(null)
const shopListLoading = ref<boolean>(false)
const assignedShopListLoading = ref<boolean>(false)
const assignLoading = ref<boolean>(false)
const availableShopList = ref<UserAssignedShopVo[]>([])
const assignedShopList = ref<UserAssignedShopVo[]>([])
const selectedAvailableShops = ref<UserAssignedShopVo[]>([])
const selectedAssignedShops = ref<UserAssignedShopVo[]>([])
const shopTotal = ref<number>(0)
const assignedShopTotal = ref<number>(0)

// 店铺类型选项（使用门店LOGO和类型名称）- 客服分配店铺中不包含抖店即时零售和饿了么官方
const shopTypeOptions = [
  { label: '美团', value: 1, icon: 'mt' },
  { label: '饿了么', value: 2, icon: 'tbsg_wm' },
  { label: '美团闪购', value: 3, icon: 'mt-shop' },
  { label: '美团医药', value: 4, icon: 'mt-medicine' },
  { label: '饿百零售', value: 5, icon: 'tbsg_ls' },
  { label: '京东到家', value: 6, icon: 'jd-home' }
]

const queryForm = reactive<GetAdminListParmsVo>({
  page: 1,
  pageSize: 20,
  word: '',
  avtag: null,
  role: 'KEFU', // 固定查询客服角色
  userType: 1,
  groupId: ''
})
const groupParams = reactive({
  grouptype: 2,
  recursionchild: true
})
const adminRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  notes: [{ required: true, message: '请输入分组描述', trigger: 'blur' }]
}

// 成员列表查询表单
const memberQueryForm = reactive<GetAdminListParmsVo>({
  page: 1,
  pageSize: 20,
  word: '',
  avtag: undefined,
  role: undefined, // 不限定角色
  userType: 1
})

// 店铺查询表单
const shopQueryForm = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  shopType: 1 // 默认选择美团
})

// 已分配店铺查询表单
const assignedShopQueryForm = reactive({
  page: 1,
  pageSize: 20,
  shopType: undefined as ShopType | undefined
})

/**
 * 过滤备注中的"积分被转移"文本（支持中文分号和英文分号）
 */
const filterNotes = (notes: string | null | undefined): string => {
  if (!notes) return ''
  // 使用正则表达式匹配分号（中文或英文）+ 积分被转移，允许前后有空格
  let result = notes.replace(/[；;]\s*积分被转移\s*/g, '')
  // 再次匹配单独的积分被转移（防止没有分号的情况）
  result = result.replace(/积分被转移\s*/g, '')
  // 移除可能残留的末尾分号和空格
  result = result.replace(/[；;]\s*$/g, '')
  return result.trim()
}

/**
 * 验证手机号
 */
const validatePhone = (rule: any, value: any, callback: any) => {
  if (isPhone(value)) {
    callback()
  } else {
    callback(new Error(translate('请输入正确的手机号')))
  }
}

/**
 * 添加员工验证规则
 */
const employeeRule = {
  phone: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机号')
    },
    { validator: validatePhone, trigger: 'blur' }
  ]
}

/**
 * 处理添加员工
 */
const handleAddEmployee = () => {
  addEmployeeDialogVisible.value = true
  employeeParams.phone = ''
  employeeParams.is_boss = false
}

/**
 * 处理编辑备注
 */
const handleEditNotes = (row: GetAdminListItemInfoVo) => {
  editNotesForm.id = row.id
  editNotesForm.notes = row.notes || ''
  editNotesDialogVisible.value = true
}

/**
 * 确认编辑备注
 */
const confirmEditNotes = () => {
  editNotesLoading.value = true
  updateAgency({
    id: editNotesForm.id,
    notes: editNotesForm.notes
  })
    .then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('修改成功!', 'success', 'hey')
        editNotesDialogVisible.value = false
        getCustomerServiceList()
      }
    })
    .catch((error: any) => {
      gp.$baseMessage(error?.message || '修改备注失败', 'error', 'hey')
    })
    .finally(() => {
      editNotesLoading.value = false
    })
}

const formatBalance = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  // 如果是整数，不显示小数位
  if (Number.isInteger(num)) {
    return num.toString()
  }
  // 否则保留一位小数
  return num.toFixed(1)
}

/**
 * 确认添加员工
 */
const confirmAddEmployee = () => {
  if (employeeFormRef.value) {
    employeeFormRef.value.validate((valid: any) => {
      if (valid) {
        addEmployeeLoading.value = true
        addUser(employeeParams)
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('添加成功！', 'success', 'hey')
              addEmployeeDialogVisible.value = false
              getCustomerServiceList()
            }
          })
          .finally(() => {
            addEmployeeLoading.value = false
          })
      }
    })
  }
}

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
 * 获取IM配置
 */
const getImConfig = async () => {
  try {
    imConfigLoading.value = true
    const config = await apiManager.imAdminApi.GetImConfig()
    imConfig.value = config
    console.log('IM配置加载成功:', config)
  } catch (error: any) {
    console.error('获取IM配置失败:', error)
    gp.$baseMessage('获取IM配置失败，请刷新页面重试', 'error', 'hey')
  } finally {
    imConfigLoading.value = false
  }
}

/**
 * 处理IM配置变更
 */
const handleImConfigChange = async () => {
  imConfigLoading.value = true
  try {
    await apiManager.imAdminApi.UpdateImConfig({
      no_auto_kefu: imConfig.value.no_auto_kefu
    })

    gp.$baseMessage(
      imConfig.value.no_auto_kefu
        ? '已开启控制:下级必须由您分配客服角色后才能使用IM客服'
        : '已关闭控制:下级可以自主开启IM客服功能',
      'success',
      'hey'
    )
  } catch (error: any) {
    // 更新失败,恢复原来的状态
    imConfig.value.no_auto_kefu = !imConfig.value.no_auto_kefu
    gp.$baseMessage(error?.message || '更新IM配置失败', 'error', 'hey')
  } finally {
    imConfigLoading.value = false
  }
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
 * 获取成员列表（用于设置客服）
 */
const getMemberList = async () => {
  memberListLoading.value = true
  try {
    const result = await apiManager.adminGroupApi.GetAdminList({
      page: memberQueryForm.page,
      pageSize: memberQueryForm.pageSize,
      word: memberQueryForm.word || undefined,
      avtag: memberQueryForm.avtag,
      role: undefined, // 不限定角色
      userType: 1
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
 * 处理设置客服
 */
const handleAddCustomerService = () => {
  addCustomerServiceDrawerVisible.value = true
  memberQueryForm.page = 1
  memberQueryForm.word = ''
  memberQueryForm.avtag = undefined
  selectedMembers.value = []
  getMemberList()
}

/**
 * 确认设置
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
      UserIds: selectedMembers.value.map(member => member.id),
      Role: 'KEFU'
    })

    gp.$baseMessage(`成功为 ${selectedMembers.value.length} 个成员设置客服角色`, 'success', 'hey')
    addCustomerServiceDrawerVisible.value = false
    await getCustomerServiceList()
  } catch (error: any) {
    gp.$baseMessage(error?.message || '设置客服失败', 'error', 'hey')
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
        type: 'warning'
      }
    )

    // 移除客服角色（批量操作接口）
    await apiManager.adminApi.RemoveSubordinateRoles({
      UserIds: [row.id],
      Role: 'KEFU'
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
const handleAssignShops = async (row: GetAdminListItemInfoVo) => {
  currentCustomer.value = row
  assignShopDrawerVisible.value = true
  shopQueryForm.keyword = ''
  shopQueryForm.shopType = 1 // 默认选择美团
  shopQueryForm.page = 1
  assignedShopQueryForm.page = 1
  selectedAvailableShops.value = []
  selectedAssignedShops.value = []
  // 重新加载店铺列表
  await Promise.all([getAvailableShopList(), getAssignedShopList()])
}

/**
 * 店铺类型切换
 */
const handleShopTypeChange = async (shopType: number) => {
  shopQueryForm.shopType = shopType
  shopQueryForm.page = 1
  assignedShopQueryForm.shopType = shopType
  assignedShopQueryForm.page = 1
  // 重新加载店铺列表
  await Promise.all([getAvailableShopList(), getAssignedShopList()])
}

/**
 * 店铺搜索
 */
const handleShopSearch = () => {
  shopQueryForm.page = 1
  // 重新加载店铺列表
  getAvailableShopList()
}

/**
 * 批量取消分配店铺（从穿梭框右侧移除）
 */
const handleBatchUnassign = async (shopIds: string[]) => {
  if (!currentCustomer.value || shopIds.length === 0) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消 ${currentCustomer.value.user_name} 对已选 ${shopIds.length} 个店铺的管理权限吗？`,
      '批量取消分配确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    assignLoading.value = true
    const result = await apiManager.shopmgApi.BatchUnassignShopsFromUser({
      UserId: currentCustomer.value.id,
      ShopIds: shopIds
    })

    gp.$baseMessage(`成功取消 ${result.TargetUserName} 对 ${result.SuccessCount} 个店铺的管理权限`, 'success', 'hey')

    // 刷新店铺列表
    await Promise.all([getAvailableShopList(), getAssignedShopList()])
  } catch (error: any) {
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '取消分配失败', 'error', 'hey')
    }
  } finally {
    assignLoading.value = false
  }
}

/**
 * 获取可分配的店铺列表（懒加载，默认20条）
 * 调用新的GetUnassignedShopsForUser接口，获取未分配给当前用户的店铺列表
 */
const getAvailableShopList = async () => {
  if (!currentCustomer.value) return

  shopListLoading.value = true
  try {
    // 调用新的API接口：获取未授权给指定用户的店铺列表
    const result = await apiManager.shopmgApi.GetUnassignedShopsForUser(
      currentCustomer.value.id, // 目标用户ID
      shopQueryForm.page, // 页码
      shopQueryForm.pageSize, // 每页数量
      shopQueryForm.shopType, // 店铺类型筛选（可选）
      shopQueryForm.keyword || undefined // 店铺名称或ID关键字搜索（可选）
    )

    // 直接使用接口返回的数据
    availableShopList.value = result?.rows || []
    shopTotal.value = result?.total || 0
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取未分配店铺列表失败', 'error', 'hey')
    availableShopList.value = []
    shopTotal.value = 0
  } finally {
    shopListLoading.value = false
  }
}

/**
 * 获取已分配的店铺列表（分页加载）
 * 使用GetUserAssignedShops接口获取已分配店铺
 */
const getAssignedShopList = async () => {
  if (!currentCustomer.value) return

  assignedShopListLoading.value = true
  try {
    // 直接使用GetUserAssignedShops接口获取已分配店铺（后端分页）
    const result = await apiManager.shopmgApi.GetUserAssignedShops(
      currentCustomer.value.id,
      assignedShopQueryForm.page,
      assignedShopQueryForm.pageSize,
      shopQueryForm.shopType
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
 * 处理未分配店铺选择变化
 */
const handleAvailableShopSelectionChange = (selection: UserAssignedShopVo[]) => {
  selectedAvailableShops.value = selection
}

/**
 * 处理已分配店铺选择变化
 */
const handleAssignedShopSelectionChange = (selection: UserAssignedShopVo[]) => {
  selectedAssignedShops.value = selection
}

/**
 * 移动到右侧（分配店铺）
 */
const handleMoveToRight = async () => {
  if (selectedAvailableShops.value.length === 0) return

  assignLoading.value = true
  try {
    const result = await apiManager.shopmgApi.BatchAssignShopsToUser({
      UserId: currentCustomer.value!.id,
      ShopIds: selectedAvailableShops.value.map(shop => shop.ShopId)
    })

    gp.$baseMessage(`成功为 ${result.TargetUserName} 分配了 ${result.SuccessCount} 个店铺`, 'success', 'hey')

    selectedAvailableShops.value = []
    await Promise.all([getAvailableShopList(), getAssignedShopList()])
  } catch (error: any) {
    gp.$baseMessage(error?.message || '分配店铺失败', 'error', 'hey')
  } finally {
    assignLoading.value = false
  }
}

/**
 * 移动到左侧（取消分配）
 */
const handleMoveToLeft = async () => {
  if (selectedAssignedShops.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `确定要取消 ${currentCustomer.value!.user_name} 对已选 ${selectedAssignedShops.value.length} 个店铺的管理权限吗？`,
      '批量取消分配确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    assignLoading.value = true
    const result = await apiManager.shopmgApi.BatchUnassignShopsFromUser({
      UserId: currentCustomer.value!.id,
      ShopIds: selectedAssignedShops.value.map(shop => shop.ShopId)
    })

    gp.$baseMessage(`成功取消 ${result.TargetUserName} 对 ${result.SuccessCount} 个店铺的管理权限`, 'success', 'hey')

    selectedAssignedShops.value = []
    await Promise.all([getAvailableShopList(), getAssignedShopList()])
  } catch (error: any) {
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '取消分配失败', 'error', 'hey')
    }
  } finally {
    assignLoading.value = false
  }
}

/**
 * 未分配店铺分页改变
 */
const handleAvailableShopPageChange = (page: number) => {
  shopQueryForm.page = page
  getAvailableShopList()
}

/**
 * 未分配店铺每页大小改变
 */
const handleAvailableShopSizeChange = (size: number) => {
  shopQueryForm.pageSize = size
  shopQueryForm.page = 1
  getAvailableShopList()
}

/**
 * 已分配店铺分页改变
 */
const handleAssignedShopPageChange = (page: number) => {
  assignedShopQueryForm.page = page
  getAssignedShopList()
}

/**
 * 已分配店铺每页大小改变
 */
const handleAssignedShopSizeChange = (size: number) => {
  assignedShopQueryForm.pageSize = size
  assignedShopQueryForm.page = 1
  getAssignedShopList()
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
    8: '饿了么官方'
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

/**
 * 获取分组数据
 */
const getGroupData = () => {
  getGroup(groupParams).then((res: any) => {
    if (res.code === 200) {
      groupList.value = res.data
    }
  })
}

/**
 * 获取所有分组（显示全部）
 */
const getAllGroup = () => {
  total.value = 0
  queryForm.groupId = ''
  getCustomerServiceList()
  currentIndex.value = 0
}

/**
 * 根据分组ID获取客服列表
 */
const getGroupForId = (id: number, index: number) => {
  total.value = 0
  queryForm.groupId = String(id)
  getCustomerServiceList()
  currentIndex.value = index + 1
}

/**
 * 添加子账号分组
 */
const addMemberGroup = () => {
  adminDioal.value = true
  currentForm = reactive<any>({
    type: 2,
    name: '',
    notes: ''
  })
}

/**
 * 编辑分组
 */
const editGroup = (row: any) => {
  currentForm = reactive<any>(row.Member)
  adminDioal.value = true
}

/**
 * 删除分组
 */
const delGroupItem = (row: any) => {
  ElMessageBox.confirm('此操作将永久移除分组, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true
  })
    .then(() => {
      delGroup(row.Member.id).then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('删除成功!', 'success', 'hey')
          getGroupData()
          getAllGroup()
        }
      })
    })
    .catch()
}

/**
 * 提交分组表单
 */
const sumAdmin = () => {
  if (ruleFormRefAdmin.value) {
    ruleFormRefAdmin.value.validate((valid: any) => {
      if (valid) {
        btnLoading.value = true
        if (currentForm.id) {
          const { id, name, notes } = currentForm
          updateGroup({ id, name, notes })
            .then((res: any) => {
              if (res.code === 200) {
                gp.$baseMessage('修改成功!', 'success', 'hey')
                adminDioal.value = false
                getGroupData()
              }
            })
            .finally(() => {
              btnLoading.value = false
            })
        } else {
          addGroup(currentForm)
            .then((res: any) => {
              if (res.code === 200) {
                gp.$baseMessage('添加成功!', 'success', 'hey')
                adminDioal.value = false
                getGroupData()
              }
            })
            .finally(() => {
              btnLoading.value = false
            })
        }
      }
    })
  }
}

// 初始化加载数据
getImConfig()
getGroupData()
getCustomerServiceList()
</script>

<style lang="scss" scoped>
.group-list {
  margin-top: 10px;

  :deep(.el-menu-item) {
    height: auto !important;
    line-height: normal !important;
  }

  .group-item {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    min-height: 40px;

    .item-right {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-left {
      flex-shrink: 0;
      margin-left: 8px;
      display: flex !important;
      align-items: center !important;

      .el-menu {
        .el-menu-item {
          text-align: center;
        }
      }
    }
  }
}

// 设置客服抽屉样式
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
.assign-shop-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .shop-type-buttons {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    :deep(.el-button-group) {
      .el-button {
        display: flex;
        align-items: center;
      }
    }
  }

  .shop-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .action-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .transfer-wrapper {
    flex: 1;
    overflow: visible;
    min-height: 500px;
    display: flex;
    flex-direction: column;

    .transfer-panels {
      display: flex;
      flex: 1;
      min-height: 0;
      gap: 16px;
      align-items: stretch;
    }

    .transfer-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 4px;
      overflow: visible;
      min-width: 0;

      .transfer-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--el-bg-color-page);
        border-bottom: 1px solid var(--el-border-color-lighter);
        flex-shrink: 0;

        .panel-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .panel-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }

        .panel-title {
          font-weight: 500;
          font-size: 14px;
        }
      }

      .transfer-panel-body {
        flex: 1;
        overflow: hidden;
        min-height: 0;
        position: relative;

        :deep(.el-table) {
          height: 100%;
        }

        :deep(.el-table__body-wrapper) {
          max-height: 100%;
          overflow-y: auto;
        }
      }

      .transfer-panel-footer {
        padding: 12px 16px;
        border-top: 1px solid var(--el-border-color-lighter);
        background-color: var(--el-bg-color-page);
        flex-shrink: 0;
        overflow: visible !important;
        min-height: 60px;
        position: relative;
        z-index: 1;

        .custom-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }

        :deep(.el-pagination) {
          overflow: visible !important;
        }

        :deep(.el-pagination *) {
          overflow: visible !important;
        }
      }
    }

    .transfer-buttons {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 12px;
      padding: 0 8px;
      flex-shrink: 0;
      align-self: stretch;
      min-height: 200px;

      .el-button {
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin: 0;
      }
    }
  }
}

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

  &[style*='display: none'] {
    display: none !important;
  }

  &:not([style*='display: none']) {
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
