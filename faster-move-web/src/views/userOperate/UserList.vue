<template>
  <div class="page user-operate-list">
    <el-alert
      v-if="!mockOn"
      type="info"
      show-icon
      :closable="false"
      class="mock-banner"
      title="Mock 总开关：当前为「真实数据源」（bridge mode = real）。本页只读，所有写操作禁用。"
    >
      <el-button size="small" type="primary" plain @click="onSwitch('mock')">切回 Mock</el-button>
    </el-alert>
    <el-alert
      v-else
      type="success"
      show-icon
      :closable="false"
      class="mock-banner"
      title="Mock 总开关：当前为「开发 Mock 数据源」（bridge mode = mock），PC / 手机两端联动。"
    >
      <el-button size="small" plain @click="onSwitch('real')">切到 真实</el-button>
    </el-alert>

    <div class="toolbar">
      <h3 class="title">用户列表（dev-bridge）</h3>
      <div class="actions">
        <el-input v-model="keyword" placeholder="按用户名/手机号搜索" clearable style="width: 240px" />
        <el-button type="primary" :disabled="!mockOn" @click="openCreate">新增用户</el-button>
        <el-button @click="loadList">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filtered" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="user_name" label="用户名" min-width="140" />
      <el-table-column prop="phone" label="手机号" width="160" />
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="shop_name" label="所属门店" min-width="160" />
      <el-table-column label="数据来源" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.__mock" type="warning" size="small">Mock</el-tag>
          <el-tag v-else type="success" size="small">真实</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="余额" width="120">
        <template #default="{ row }">{{ Number(row.balance || 0).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="integral" label="积分" width="100" />
      <el-table-column prop="create_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" :disabled="!mockOn" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!mockOn" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="520" @close="resetForm">
      <el-form ref="formRef" :model="form" label-width="92" :rules="rules">
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="form.user_name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="ADMIN" value="ADMIN" />
            <el-option label="AGENCY" value="AGENCY" />
            <el-option label="STAFF" value="STAFF" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属门店" prop="shop_id">
          <el-select v-model="form.shop_id" style="width: 100%" filterable>
            <el-option
              v-for="s in stores"
              :key="s.shop_id"
              :label="`${s.shop_name} (${s.platform_title})`"
              :value="s.shop_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="form.balance" :min="0" :precision="2" controls-position="right" />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="form.integral" :min="0" :step="10" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  fetchStores,
  subscribeEvents,
  type DevStore,
  type DevUser
} from '/@/api/userOperate'
import { devMockOn, refreshDevMockConfig, setBridgeMode } from '/@/config/devMock'

const mockOn = devMockOn
async function onSwitch(mode: 'mock' | 'real') {
  try {
    await setBridgeMode(mode)
    ElMessage.success(`已切换到 ${mode}`)
  } catch (e) {
    ElMessage.error('切换失败：' + (e as Error).message)
  }
}

const loading = ref(false)
const saving = ref(false)
const list = ref<DevUser[]>([])
const stores = ref<DevStore[]>([])
const keyword = ref('')
const dialogVisible = ref(false)
const formRef = ref<{ validate?: (cb: (ok: boolean) => void) => void } | null>(null)

const emptyForm = (): Partial<DevUser> => ({
  user_name: '',
  phone: '',
  role: 'STAFF',
  shop_id: undefined,
  balance: 0,
  integral: 0
})

const form = reactive<Partial<DevUser>>(emptyForm())

const rules = {
  user_name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  shop_id: [{ required: true, message: '请选择门店', trigger: 'change' }]
}

const filtered = computed(() => {
  const k = keyword.value.trim()
  if (!k) return list.value
  return list.value.filter(u => (u.user_name || '').includes(k) || (u.phone || '').includes(k))
})

async function loadList() {
  loading.value = true
  try {
    const [u, s] = await Promise.all([fetchUsers(), fetchStores()])
    list.value = u.data?.list || []
    stores.value = s.data || []
  } catch (e) {
    ElMessage.error('加载失败：' + (e as Error).message)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: DevUser) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!form.user_name || !form.role || !form.shop_id) {
    ElMessage.warning('请补全必填项')
    return
  }
  saving.value = true
  try {
    if (form.id) {
      await updateUser(form as DevUser)
      ElMessage.success('已更新')
    } else {
      await addUser(form)
      ElMessage.success('已新增')
    }
    dialogVisible.value = false
    await loadList()
  } catch (e) {
    ElMessage.error('保存失败：' + (e as Error).message)
  } finally {
    saving.value = false
  }
}

async function confirmDelete(row: DevUser) {
  try {
    await ElMessageBox.confirm(`确认删除用户「${row.user_name}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteUser(row.id)
    ElMessage.success('已删除')
    await loadList()
  } catch (e) {
    ElMessage.error('删除失败：' + (e as Error).message)
  }
}

let pendingTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribe: (() => void) | null = null
function scheduleReload() {
  if (pendingTimer) return
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    void loadList()
  }, 400)
}

onMounted(async () => {
  await refreshDevMockConfig()
  void loadList()
  unsubscribe = subscribeEvents(
    evt => {
      if (evt.resource === 'users' || evt.resource === 'stores') scheduleReload()
    },
    { onSystem: () => scheduleReload() }
  )
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  if (pendingTimer) clearTimeout(pendingTimer)
})
</script>

<style scoped>
.page {
  padding: 20px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.mock-banner {
  margin-bottom: 16px;
  border-radius: 12px;
}
</style>
