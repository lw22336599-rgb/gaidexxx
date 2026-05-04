<template>
  <div
    class="column-table-container no-background-container auto-height-container"
    :class="{ 'fullscreen-container': isFullscreen }"
  >
    <el-row v-loading="listLoading" :gutter="20">
      <el-col :lg="5" :md="24" :sm="24" :xl="4" :xs="24">
        <vab-card class="auto-height-card">
          <el-button :icon="Plus" native-type="submit" type="primary" @click="addMemberGroup">添加子账号分组</el-button>
          <div class="group-list">
            <el-menu default-active="1">
              <el-menu-item @click="getAllGroup">
                <div>
                  全部
                  <span v-if="currentIndex === 0 && total > 0" :class="{ 'blur-text': demoMode }">({{ total }})</span>
                </div>
              </el-menu-item>
              <el-menu-item
                v-for="(item, index) in groupList"
                :key="item.Member.id"
                @click="getGroupForId(item.Member.id, index)"
              >
                <div class="group-item">
                  <div class="item-right">
                    {{ item.Member.name }}
                    <span v-if="currentIndex === index + 1 && total > 0" :class="{ 'blur-text': demoMode }"
                      >({{ total }})</span
                    >
                  </div>
                  <div class="item-left" @click.stop>
                    <el-popover placement="right">
                      <ul class="el-menu" style="border-right: none">
                        <li class="el-menu-item" @click="editGroup(item)">
                          <span>编辑分组</span>
                        </li>
                        <li class="el-menu-item" @click="delGroupItem(item)">
                          <span>删除分组</span>
                        </li>
                      </ul>
                      <template #reference>
                        <vab-icon icon="more-fill" />
                      </template>
                    </el-popover>
                  </div>
                </div>
              </el-menu-item>
            </el-menu>
          </div>
        </vab-card>
      </el-col>
      <el-col :lg="19" :md="24" :sm="24" :xl="20" :xs="24">
        <vab-card class="auto-height-card">
          <vab-query-form>
            <vab-query-form-top-panel :span="12">
              <el-form inline :model="queryForm" @submit.prevent>
                <el-form-item>
                  <el-input
                    v-model="queryForm.word"
                    clearable
                    placeholder="请输入账号进行搜索"
                    @change="getAdminListData"
                  />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="queryForm.avtag" placeholder="请选择账号状态" @change="getAdminListData">
                    <el-option label="启用" :value="true" />
                    <el-option label="停用" :value="false" />
                  </el-select>
                </el-form-item>
              </el-form>
            </vab-query-form-top-panel>
            <vab-query-form-left-panel :span="12" style="display: flex; justify-content: flex-end">
              <el-button :icon="Plus" type="primary" @click="handleAdd">添加成员</el-button>
            </vab-query-form-left-panel>
          </vab-query-form>
          <el-table ref="tableRef" :data="list" :default-sort="{ prop: 'balance', order: 'descending' }">
            <el-table-column align="center" fixed label="账号" prop="user_name" width="140">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.user_name || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column v-if="tabmimashow" align="center" fixed label="密码" prop="password" width="140">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.password || '-' }}</div>
              </template>
            </el-table-column>
            <!-- <el-table-column v-permissions="{ role: ['admin'] }" align="center" fixed label="密码" prop="password" width="140" /> -->
            <el-table-column align="center" fixed label="手机号" prop="phone" width="140">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.phone || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed label="邀请码" prop="code" width="100">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.code || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed label="账号ID" prop="code" width="100">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.code || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="备注" prop="notes" width="120">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.notes || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="剩余积分" prop="balance" sortable width="120">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ formatBalance(row.balance) }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="团队ID" prop="team_id" width="100">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.team_id || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="美团外卖门店数" prop="mt_count" width="140" />
            <el-table-column align="center" label="饿了么门店数" prop="ele_count" width="120" />
            <el-table-column align="center" label="账户状态" prop="avtag">
              <template #default="{ row }">
                <el-switch v-model="row.avtag" @change="switchStatus(row)" />
              </template>
            </el-table-column>
            <el-table-column label="注册时间" prop="crtim" width="180">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.crtim || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="上次登录时间" prop="login_time" width="180">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.login_time || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column label="登录IP" prop="login_ip" width="180">
              <template #default="{ row }">
                <div :class="{ 'blur-text': demoMode }">{{ row.login_ip || '-' }}</div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="240px">
              <template #default="{ row }">
                <el-button type="text" @click="fpjf(row)">分配积分</el-button>
                <el-button type="text" @click="editAccount(row)">编辑</el-button>
                <el-button v-if="tabmimashow" type="text" @click="handleGetGoogleAuthCode(row)"
                  >获取谷歌验证码</el-button
                >
                <el-button v-if="tabmimashow" type="text" style="color: #e6a23c" @click="handleResetToken(row)"
                  >重置令牌</el-button
                >
              </template>
            </el-table-column>
            <template #empty>
              <el-empty class="vab-data-empty" description="暂无数据" />
            </template>
          </el-table>
          <vab-pagination
            :current-page="queryForm.page"
            :page-size="queryForm.pageSize"
            :total="total"
            :class="{ 'demo-mode': demoMode }"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </vab-card>
      </el-col>
    </el-row>
    <el-dialog
      v-model="adminDioal"
      :destroy-on-close="true"
      :title="currentForm.id ? '编辑子账号' : '添加子账号'"
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
    <el-dialog v-model="jfdioal" :destroy-on-close="true" title="分配积分" width="500px">
      <div class="jifenbox">
        <el-form ref="ruleFormRef" class="demo-ruleForm" label-width="100" :model="form" :rules="rules">
          <el-form-item label="对方用户ID" prop="id">
            <el-input v-model="form.id" disabled />
          </el-form-item>
          <el-form-item label="分配积分" prop="balance">
            <el-input v-model="form.balance" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%; display: flex; justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="sumjfen">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog v-model="dialogFormVisible" title="添加用户" width="500px">
      <el-form ref="ruleForm" :model="userParams" :rules="userRule">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userParams.phone" autocomplete="off" size="small" />
        </el-form-item>
        <div style="font-size: 14px; color: #e02020">
          密码会自动以短信的形式下发到手机号，请确保填写的手机号能正常接收短信。
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="btnLoading" type="primary" @click="addAdmin">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer
      v-if="editDrawer"
      v-model="editDrawer"
      :before-close="handleCloseDrawer"
      direction="rtl"
      title="编辑子账号"
    >
      <div class="edit-drawer">
        <el-form label-width="80px" :model="currentUserInfo">
          <el-form-item label="账户名称">
            <el-input v-model="currentUserInfo.user_name" disabled />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="currentUserInfo.password" placeholder="输入新密码" />
          </el-form-item>
          <el-form-item label="所属分组">
            <el-select v-model="currentUserInfo.group" placeholder="选择分组">
              <el-option
                v-for="item in groupList"
                :key="item.Member.id"
                :label="item.Member.name"
                :value="item.Member.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注信息">
            <el-input v-model="currentUserInfo.notes" placeholder="输入备注信息" :rows="3" type="textarea" />
          </el-form-item>
          <el-form-item label="分配门店" class="shop-tree-item">
            <el-tree
              ref="shopGroupTree"
              :data="shopGroupList"
              :default-checked-keys="defaultChecked"
              :default-expanded-keys="defaultExpanded"
              node-key="id"
              :props="defaultProps"
              show-checkbox
            >
              <template #empty>
                <div style="text-align: center; padding: 10px 0">暂无数据</div>
              </template>
            </el-tree>
          </el-form-item>
          <el-form-item>
            <el-button class="addmdbut" :loading="editLoading" type="primary" @click="updateAccount">保存</el-button>
            <el-button @click="handleCloseDrawer">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, TableInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { getGroup } from '/@/api/shop.ts'
import {
  addGroup,
  addUser,
  connectGroup,
  delGroup,
  getAdminList,
  linkShopGroup,
  updateAgency,
  updateGroup,
  giveIntegral
} from '/@/api/group.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { isPhone } from '/@/utils/validate.ts'
import { translate } from '/@/i18n'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type { ResetGoogleAuthenticatorVo } from '/@/TsModel/Alien/Controllers/Admin/ResetGoogleAuthenticatorVo'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '/@/store/modules/settings'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

defineOptions({
  name: 'ColumnTable'
})

const adminDioal = ref(false)
const tableRef = ref<TableInstance>()
const list = ref<any>([])
const isFullscreen = ref<boolean>(false)
const listLoading = ref<boolean>(true)
const ruleFormRefAdmin = ref<TableInstance>()
const ruleFormRef = ref<TableInstance>()
const ruleForm = ref<TableInstance>()
const shopGroupTree = ref<FormInstance>()
const total = ref<number>(0)
const btnLoading = ref(false)
const jfdioal = ref(false)
const dialogFormVisible = ref(false)
const userParams = reactive({
  phone: '',
  is_boss: false
})
let form = reactive({
  id: '',
  balance: '',
  code: ''
})
const rules = {
  id: [{ required: true, message: '请输入对方用户ID', trigger: 'blur' }],
  balance: [{ required: true, message: '请输入分配积分', trigger: 'blur' }]
}
const validatePhone = (rule: any, value: any, callback: any) => {
  if (isPhone(value)) {
    callback()
  } else {
    callback(new Error(translate('请输入正确的手机号')))
  }
}
const tabmimashow = ref<boolean>(false)
onMounted(() => {
  let userinfor = localStorage.getItem('userInfo')
  // 通过 userInfo.admin.role 判断是否为管理员，role 包含 "ADMIN" 即为管理员
  if (userinfor) {
    try {
      const adminInfo = JSON.parse(userinfor).admin
      // 判断 role 是否为数组且包含 "ADMIN"
      if (Array.isArray(adminInfo.role) && adminInfo.role.includes('ADMIN')) {
        tabmimashow.value = true
      } else {
        tabmimashow.value = false
      }
    } catch (e) {
      // 解析异常时，默认不显示密码
      tabmimashow.value = false
    }
  } else {
    tabmimashow.value = false
  }
})
const userRule = {
  phone: [
    {
      required: true,
      trigger: 'blur',
      message: translate('请输入手机号')
    },
    { validator: validatePhone, trigger: 'blur' }
  ]
}
const addAdmin = () => {
  if (ruleForm.value)
    ruleForm.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        addUser(userParams)
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('添加成功！', 'success', 'hey')
              getAdminListData()
              dialogFormVisible.value = false
            }
          })
          .finally(() => {
            btnLoading.value = false
          })
      }
    })
}
const sumjfen = () => {
  if (ruleFormRef.value)
    ruleFormRef.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true

        giveIntegral({
          userId: form.code,
          giveVal: parseInt(form.balance)
          // giveVal: parseInt(form.balance) + parseInt(currentRow.value.balance),
        })
          .then((res: any) => {
            if (res.code === 200) {
              gp.$baseMessage('分配成功', 'success', 'hey')
              getAdminListData()
              jfdioal.value = false
            }
          })
          .finally(() => {
            btnLoading.value = false
          })
      }
    })
}
const queryForm = reactive<any>({
  page: 1,
  pageSize: 20,
  word: '',
  avtag: true,
  groupId: '',
  userType: 1
})
let currentForm = reactive({
  type: 2,
  name: '',
  notes: ''
})
const adminRules = {
  name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  notes: [{ required: true, message: '请输入分组描述', trigger: 'blur' }]
}

const sumAdmin = () => {
  if (ruleFormRefAdmin.value)
    ruleFormRefAdmin.value?.validate(async (valid: any) => {
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
const currentRow = ref({})
const fpjf = (row: any) => {
  jfdioal.value = true
  form = reactive({
    id: row.id,
    balance: '',
    code: row.code
  })
  currentRow.value = row
}
const switchStatus = (row: any) => {
  updateAgency({
    id: row.id,
    avtag: row.avtag
  }).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage(`账户已${row.avtag ? '启' : '停'}用`, 'success', 'hey')
      getAdminListData()
    }
  })
}
const addMemberGroup = () => {
  adminDioal.value = true
  currentForm = reactive({
    type: 2,
    name: '',
    notes: ''
  })
}
const editGroup = (row: any) => {
  currentForm = reactive(row.Member)
  adminDioal.value = true
  console.log(currentForm)
}
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
        }
      })
    })
    .catch()
}
const groupList = ref<any>([])
const shopGroupList = ref<any>([])
const fetchData = async () => {
  listLoading.value = true
  try {
    const res: any = await getGroup(groupParams)
    if (res.code === 200) {
      groupList.value = res.data
    }
    const res2: any = await getAdminList(queryForm)
    if (res2.code === 200) {
      list.value = res2.data.rows
      total.value = res2.data.total
    }
    const res3: any = await getGroup({ grouptype: 1, recursionchild: true })
    if (res3.code === 200) {
      shopGroupList.value = res3.data
      setMemberId(shopGroupList.value)
    }
  } finally {
    listLoading.value = false
  }
}

const setMemberId = arr => {
  if (arr && arr.length > 0) {
    arr.forEach(item => {
      item.id = item.Member.id
      if (item.children && item.children.length > 0) {
        setMemberId(item.children)
      }
    })
  }
}

const handleSizeChange = (value: number) => {
  queryForm.page = 1
  queryForm.pageSize = value
  getAdminListData()
}

const handleCurrentChange = (value: number) => {
  queryForm.page = value
  getAdminListData()
}
const handleAdd = () => {
  dialogFormVisible.value = true
  userParams.phone = ''
}
const groupParams = reactive({
  grouptype: 2,
  recursionchild: true
})
const getGroupData = () => {
  getGroup(groupParams).then((res: any) => {
    if (res.code === 200) {
      groupList.value = res.data
    }
  })
}
const getAdminListData = () => {
  listLoading.value = true
  getAdminList(queryForm)
    .then((res: any) => {
      if (res.code === 200) {
        list.value = res.data.rows
        total.value = res.data.total
      }
    })
    .finally(() => {
      listLoading.value = false
    })
}
fetchData()
const editDrawer = ref(false)
const currentUserInfo = ref({})
const editLoading = ref(false)
const defaultChecked = ref([])
const defaultExpanded = ref([])
const defaultProps = {
  children: 'children',
  label: (data: any) => {
    return data.Member.name
  }
}
const editAccount = (row: any) => {
  currentUserInfo.value = JSON.parse(JSON.stringify(row))
  editDrawer.value = true
  defaultChecked.value = currentUserInfo.value.shop_groups ? JSON.parse(currentUserInfo.value.shop_groups) : []
  console.log(defaultChecked.value)
}
const handleCloseDrawer = () => {
  editDrawer.value = false
  currentUserInfo.value = {}
}
const updateAccount = async () => {
  editLoading.value = true
  try {
    await updateAgency({
      id: currentUserInfo.value.id,
      notes: currentUserInfo.value.notes,
      password: currentUserInfo.value.password
    })
    if (currentUserInfo.value.group) {
      await connectGroup({ adminIds: [currentUserInfo.value.id], groupId: currentUserInfo.value.group })
    }
    const checkedKeys = shopGroupTree.value?.getCheckedKeys()
    if (checkedKeys && checkedKeys.length > 0) {
      await linkShopGroup({ admin: currentUserInfo.value.id, shop_groups: checkedKeys })
    }
    gp.$baseMessage('保存成功!', 'success', 'hey')
    await handleCloseDrawer()
    await getAdminListData()
  } finally {
    editLoading.value = false
  }
}
const currentIndex = ref(0)
const getAllGroup = () => {
  total.value = 0
  queryForm.groupId = ''
  getAdminListData()
  currentIndex.value = 0
}
const getGroupForId = (id: number, index: number) => {
  total.value = 0
  queryForm.groupId = id
  getAdminListData()
  currentIndex.value = index + 1
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
 * 获取指定用户的谷歌验证码（仅管理员可用）
 * @param row 用户信息行数据
 */
const handleGetGoogleAuthCode = async (row: any) => {
  try {
    const res = await apiManager.adminApi.GetUserGoogleAuthCode({
      UserId: String(row.id)
    })
    // 自动复制验证码到剪贴板
    try {
      await navigator.clipboard.writeText(res.Code)
      gp.$baseMessage('验证码已复制到剪贴板', 'success', 'hey')
    } catch {
      // clipboard API 不可用时静默跳过
    }
    await ElMessageBox.alert(
      `用户：${res.UserName || row.user_name}\n当前验证码：${res.Code}\n（验证码约30秒刷新一次）`,
      '谷歌验证码',
      { confirmButtonText: '确定' }
    )
  } catch (error: any) {
    gp.$baseMessage(error?.message || '获取谷歌验证码失败', 'error', 'hey')
  }
}

/**
 * 重置用户的谷歌验证码令牌
 * 清除目标用户的谷歌验证码密钥和启用状态，用户需要重新绑定
 * @param row 用户信息行数据
 */
const handleResetToken = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户"${row.user_name}"的谷歌验证码令牌吗？重置后该用户需要重新绑定谷歌验证器。`,
      '重置令牌确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const vo: ResetGoogleAuthenticatorVo = {
      UserId: row.id
    }

    await apiManager.adminApi.ResetGoogleAuthenticator(vo)
    gp.$baseMessage('令牌重置成功，该用户需要重新绑定谷歌验证器', 'success', 'hey')
  } catch (error: any) {
    // 如果是用户取消操作，error 会是字符串 'cancel'，不需要提示
    if (error !== 'cancel') {
      gp.$baseMessage(error?.message || '重置令牌失败', 'error', 'hey')
    }
  }
}
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

.jifenbox {
  padding-bottom: 20px;
}

.shop-tree-item {
  :deep(.el-form-item__content) {
    display: flex;
    align-items: flex-start;
  }
}

.blur-text {
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
</style>
