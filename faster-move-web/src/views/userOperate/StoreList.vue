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
      <el-space>
        <el-button size="small" :loading="busy" @click="onResetSeed">还原 15/20/5 种子</el-button>
        <el-button size="small" type="danger" plain :loading="busy" @click="onClearSeed">清空 Mock 数据</el-button>
        <el-button size="small" plain @click="onSwitch('real')">切到 真实</el-button>
      </el-space>
    </el-alert>

    <el-alert
      v-if="platformFilter"
      type="info"
      show-icon
      :closable="false"
      class="mock-banner"
      :title="`已从首页带入平台筛选：${platformLabel}`"
    >
      <el-button size="small" plain @click="clearPlatformQuery">查看全部门店</el-button>
    </el-alert>

    <div class="toolbar">
      <h3 class="title">门店列表（dev-bridge）</h3>
      <div class="actions">
        <el-input v-model="keyword" placeholder="按门店名/平台搜索" clearable style="width: 220px" />
        <el-button type="primary" :disabled="!mockOn" @click="openCreate">新增门店</el-button>
        <el-button @click="loadList">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filtered" border stripe style="width: 100%">
      <el-table-column prop="shop_id" label="ID" width="80" />
      <el-table-column prop="shop_name" label="门店名称" min-width="180" />
      <el-table-column prop="platform_title" label="平台" width="120" />
      <el-table-column label="数据来源" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.__mock" type="warning" size="small">Mock</el-tag>
          <el-tag v-else type="success" size="small">真实</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '在线' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="200" />
      <el-table-column prop="create_time" label="创建时间" width="180" />
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" :disabled="!mockOn" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!mockOn" @click="confirmDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.shop_id ? '编辑门店' : '新增门店'" width="520" @close="resetForm">
      <el-form :model="form" label-width="92">
        <el-form-item label="门店名称">
          <el-input v-model="form.shop_name" />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="form.platform_type" style="width: 100%">
            <el-option label="美团" value="mt-shop-feature" />
            <el-option label="饿了么" value="elm-shop-feature" />
            <el-option label="京东到家" value="jd-shop-feature" />
            <el-option label="抖音零售" value="dy-retail-feature" />
            <el-option label="美团医药" value="mt-medicine-feature" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在线</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" />
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchStores, addStore, updateStore, deleteStore, subscribeEvents, type DevStore } from '/@/api/userOperate'
import { devMockOn, refreshDevMockConfig, clearBridgeSeed, resetBridgeSeed, setBridgeMode } from '/@/config/devMock'

const mockOn = devMockOn
const route = useRoute()
const router = useRouter()

const platformTitles: Record<string, string> = {
  'mt-shop-feature': '美团',
  'elm-shop-feature': '饿了么',
  'jd-shop-feature': '京东到家',
  'dy-retail-feature': '抖音零售',
  'mt-medicine-feature': '美团医药'
}

const platformFilter = computed(() => String(route.query.platform || '').trim())
const platformLabel = computed(() => platformTitles[platformFilter.value] || platformFilter.value)

function clearPlatformQuery() {
  const q = { ...route.query } as Record<string, unknown>
  delete q.platform
  router.replace({ path: route.path, query: q as Record<string, string> })
}

const loading = ref(false)
const saving = ref(false)
const list = ref<DevStore[]>([])
const keyword = ref('')
const dialogVisible = ref(false)

const emptyForm = (): Partial<DevStore> => ({
  shop_name: '',
  platform_type: 'mt-shop-feature',
  status: 1,
  address: ''
})
const form = reactive<Partial<DevStore>>(emptyForm())

const filtered = computed(() => {
  let rows = list.value
  const pf = platformFilter.value
  if (pf) {
    rows = rows.filter(s => s.platform_type === pf)
  }
  const k = keyword.value.trim()
  if (!k) return rows
  return rows.filter(s => (s.shop_name || '').includes(k) || (s.platform_title || '').includes(k))
})

async function loadList() {
  loading.value = true
  try {
    const r = await fetchStores()
    list.value = r.data || []
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

function openEdit(row: DevStore) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submit() {
  if (!form.shop_name) {
    ElMessage.warning('请填写门店名称')
    return
  }
  saving.value = true
  try {
    if (form.shop_id) {
      await updateStore(form as DevStore)
      ElMessage.success('已更新')
    } else {
      await addStore(form)
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

async function confirmDelete(row: DevStore) {
  try {
    await ElMessageBox.confirm(`确认删除门店「${row.shop_name}」？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteStore(row.shop_id)
    ElMessage.success('已删除')
    await loadList()
  } catch (e) {
    ElMessage.error('删除失败：' + (e as Error).message)
  }
}

let pendingTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribe: (() => void) | null = null
const busy = ref(false)
function scheduleReload() {
  if (pendingTimer) return
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    void loadList()
  }, 400)
}

async function onClearSeed() {
  try {
    await ElMessageBox.confirm('确认清空 Mock 数据？此操作会同步生效到 PC/手机两端。', '清空确认', {
      type: 'warning'
    })
  } catch {
    return
  }
  busy.value = true
  try {
    await clearBridgeSeed()
    ElMessage.success('已清空 Mock 数据')
  } catch (e) {
    ElMessage.error('清空失败：' + (e as Error).message)
  } finally {
    busy.value = false
  }
}
async function onResetSeed() {
  busy.value = true
  try {
    await resetBridgeSeed()
    ElMessage.success('已还原默认 15/20/5 种子数据')
  } catch (e) {
    ElMessage.error('还原失败：' + (e as Error).message)
  } finally {
    busy.value = false
  }
}
async function onSwitch(mode: 'mock' | 'real') {
  try {
    await setBridgeMode(mode)
    ElMessage.success(`已切换到 ${mode}`)
  } catch (e) {
    ElMessage.error('切换失败：' + (e as Error).message)
  }
}

onMounted(async () => {
  await refreshDevMockConfig()
  void loadList()
  unsubscribe = subscribeEvents(
    evt => {
      if (evt.resource === 'stores') scheduleReload()
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
