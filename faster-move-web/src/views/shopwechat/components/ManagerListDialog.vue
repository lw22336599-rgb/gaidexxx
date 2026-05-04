<template>
  <el-dialog v-model="dialogVisible" title="管理员列表" width="700px" :close-on-click-modal="false">
    <el-table v-loading="loading" :data="managerList" height="400px" style="width: 100%">
      <el-table-column label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :src="row.HeadImg || undefined" :size="40" :class="{ 'blur-avatar': demoMode }">
            <el-icon>
              <UserFilled />
            </el-icon>
          </el-avatar>
        </template>
      </el-table-column>

      <el-table-column label="昵称" prop="Name" min-width="150">
        <template #default="{ row }">
          <div class="name-text" :class="{ 'blur-text': demoMode }">{{ row.Name || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="wxid" prop="Offid" min-width="200">
        <template #default="{ row }">
          <div class="offid-text" :class="{ 'blur-text': demoMode }">{{ row.Offid || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="备注" prop="Remark" min-width="150">
        <template #default="{ row }">
          <div class="remark-text" :class="{ 'blur-text': demoMode }">{{ row.Remark || '-' }}</div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { ChatMemberItem } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { useSettingsStore } from '@/store/modules/settings'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

interface Props {
  visible: boolean
  robot: t_chat_push_list | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value)
})

const loading = ref(false)
const managerList = ref<ChatMemberItem[]>([])

// 兼容后端返回字段大小写差异：
// - TypeScript 接口使用 MannagerOffIds（首字母大写）
// - 后端 JSON 可能是 mannagerOffIds（首字母小写）
const getManagerIds = (robot: t_chat_push_list): string[] => {
  if (!robot) return []

  const anyRobot = robot as any

  // 优先使用接口定义的字段
  if (Array.isArray(robot.MannagerOffIds) && robot.MannagerOffIds.length > 0) {
    return robot.MannagerOffIds
  }

  // 兼容小写开头的字段（后端序列化默认行为）
  if (Array.isArray(anyRobot.mannagerOffIds) && anyRobot.mannagerOffIds.length > 0) {
    // 同步一份到标准字段，方便后续使用
    ;(robot as any).MannagerOffIds = anyRobot.mannagerOffIds
    return anyRobot.mannagerOffIds
  }

  return []
}

// 监听对话框打开，加载管理员列表
watch(
  () => props.visible,
  async newValue => {
    if (newValue && props.robot) {
      await loadManagerList()
    }
  }
)

// 加载管理员列表
const loadManagerList = async () => {
  if (!props.robot) return

  try {
    loading.value = true

    const managerIds = getManagerIds(props.robot)

    // 检查是否有管理员ID
    if (!managerIds || managerIds.length === 0) {
      ElMessage.warning('该机器人未配置管理员')
      managerList.value = []
      return
    }

    console.log(`[${props.robot.name}] 加载管理员列表:`, managerIds)

    // 调用后端API获取成员列表
    const members = await apiManager.chatMgApi.GetMemberList(props.robot.id, managerIds)

    managerList.value = members || []

    console.log(`[${props.robot.name}] 管理员列表加载成功:`, members.length, '个')
  } catch (error: any) {
    console.error('加载管理员列表失败:', error)
    ElMessage.error(error?.message || '加载管理员列表失败')
    managerList.value = []
  } finally {
    loading.value = false
  }
}

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  managerList.value = []
}
</script>

<style scoped lang="scss">
.name-text {
  color: #333;
  font-weight: 500;
}

.offid-text {
  color: #666;
  font-size: 13px;
  font-family: monospace;
}

.remark-text {
  color: #999;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.blur-text {
  filter: blur(3px);
  user-select: none;
}

.blur-avatar {
  filter: blur(3px);
  user-select: none;
}
</style>
