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
      <h3 class="title">待办列表（dev-bridge）</h3>
      <div class="actions">
        <el-input v-model="keyword" placeholder="按标题搜索" clearable style="width: 220px" />
        <el-button type="primary" :disabled="!mockOn" @click="openCreate">新增待办</el-button>
        <el-button @click="loadList">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filtered" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="280" />
      <el-table-column label="负责人" width="160">
        <template #default="{ row }">{{ userName(row.user_id) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'warning'">
            {{ row.status === 1 ? '已完成' : '待办' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="due" label="截止时间" width="200" />
      <el-table-column label="数据来源" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.__mock" type="warning" size="small">Mock</el-tag>
          <el-tag v-else type="success" size="small">真实</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" :disabled="!mockOn" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!mockOn" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑待办' : '新增待办'" width="520" @close="resetForm">
      <el-form :model="form" label-width="92">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="form.user_id" style="width: 100%" filterable>
            <el-option v-for="u in users" :key="u.id" :label="`${u.user_name} (${u.role})`" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">待办</el-radio>
            <el-radio :label="1">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-input v-model="form.due" placeholder="例如：2026-05-10 18:00" />
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
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  fetchUsers,
  subscribeEvents,
  type DevTodo,
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
const list = ref<DevTodo[]>([])
const users = ref<DevUser[]>([])
const keyword = ref('')
const dialogVisible = ref(false)

const emptyForm = (): Partial<DevTodo> => ({
  title: '',
  user_id: undefined,
  status: 0,
  due: ''
})
const form = reactive<Partial<DevTodo>>(emptyForm())

const filtered = computed(() => {
  const k = keyword.value.trim()
  if (!k) return list.value
  return list.value.filter(t => (t.title || '').includes(k))
})

function userName(id: number) {
  const u = users.value.find(x => x.id === id)
  return u ? u.user_name : `#${id}`
}

async function loadList() {
  loading.value = true
  try {
    const [t, u] = await Promise.all([fetchTodos(), fetchUsers()])
    list.value = t.data || []
    users.value = u.data?.list || []
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

function openEdit(row: DevTodo) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!form.title || !form.user_id) {
    ElMessage.warning('请补全标题与负责人')
    return
  }
  saving.value = true
  try {
    if (form.id) {
      await updateTodo(form as DevTodo)
      ElMessage.success('已更新')
    } else {
      await addTodo(form)
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

async function confirmDelete(row: DevTodo) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.title}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteTodo(row.id)
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
      if (evt.resource === 'todos' || evt.resource === 'users') scheduleReload()
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
