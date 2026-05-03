<template>
  <div class="robot-list-container">
    <!-- 头部操作栏 -->
    <div class="list-header">
      <el-button type="primary" :icon="Plus" @click="handleAddRobot">
        添加机器人
      </el-button>
      <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
    </div>

    <!-- 机器人列表 -->
    <el-table v-loading="loading" :data="robotList" stripe style="width: 100%">
      <el-table-column label="机器人信息" min-width="200">
        <template #default="{ row }">
          <div class="robot-info">
            <el-avatar :src="row.head_img || undefined" :icon="UserFilled" :size="40" :class="{ 'blur-avatar': demoMode }" />
            <div class="info-text">
              <div class="name" :class="{ 'blur-text': demoMode }">{{ row.name || '未命名' }}</div>
              <div class="offid" :class="{ 'blur-text': demoMode }">{{ row.offid || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-tag :type="getChatTypeTagType(row.chat_type)">
            {{ getChatTypeName(row.chat_type) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="在线状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.on_line ? 'success' : 'info'" size="small">
            <el-icon style="margin-right: 4px">
              <CircleCheck v-if="row.on_line" />
              <CircleClose v-else />
            </el-icon>
            {{ row.on_line ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="连接状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="getRuntimeState(row.id)" :type="getConnectionStatusTagType(row, getRuntimeState(row.id))"
            size="small">
            {{ getConnectionStatusText(row, getRuntimeState(row.id)) }}
          </el-tag>
          <span v-else class="text-secondary">-</span>
        </template>
      </el-table-column>

      <el-table-column label="联系人" width="120" align="center">
        <template #default="{ row }">
          <div v-if="getRuntimeState(row.id)" class="contact-stats">
            <span class="stat-item" :class="{ 'blur-text': demoMode }">
              好友: {{ getRuntimeState(row.id)!.friends.length }}
            </span>
            <span class="stat-item" :class="{ 'blur-text': demoMode }">
              群: {{ getRuntimeState(row.id)!.groups.length }}
            </span>
          </div>
          <span v-else class="text-secondary">-</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button v-if="!row.on_line" type="primary" size="small" @click="handleConnect(row)">
              连接
            </el-button>
            <el-button v-else type="warning" size="small" @click="handleDisconnect(row)">
              断开
            </el-button>
            <el-button v-if="row.chat_type === ChatType.WechatPc" type="success" size="small"
              @click="handleViewManagers(row)">
              管理员
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" :class="{ 'demo-mode': demoMode }" />
    </div>

    <!-- 管理员列表对话框 -->
    <ManagerListDialog v-model:visible="managerDialogVisible" :robot="selectedRobot" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  UserFilled,
  CircleCheck,
  CircleClose,
} from '@element-plus/icons-vue'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { useWechatRobotStore } from '@/store/modules/wechatRobot'
import { useUserStore } from '@/store/modules/user'
import { useSettingsStore } from '@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { SignalRConnectionState } from '@/types/wechat'
import ManagerListDialog from './ManagerListDialog.vue'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

interface Emits {
  (e: 'add'): void
  (e: 'connect', robot: t_chat_push_list): void
  (e: 'disconnect', robot: t_chat_push_list): void
}

const emit = defineEmits<Emits>()

const wechatRobotStore = useWechatRobotStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 管理员列表对话框
const managerDialogVisible = ref(false)
const selectedRobot = ref<t_chat_push_list | null>(null)

// 机器人列表
const robotList = computed(() => wechatRobotStore.getAllRobots)

// 获取运行时状态
const getRuntimeState = (robotId: string) => {
  return wechatRobotStore.getRuntimeState(robotId)
}

// 获取ChatType名称
const getChatTypeName = (type: ChatType): string => {
  const names: Record<ChatType, string> = {
    [ChatType.None]: '未知',
    [ChatType.WechatPc]: '微信PC',
    [ChatType.WechatIpad]: '微信iPad',
    [ChatType.WechatWeb]: '微信Web',
    [ChatType.WechatWebHook]: '企业微信',
    [ChatType.DingdingWebHook]: '钉钉',
    [ChatType.FeishuWebHook]: '飞书',
  }
  return names[type] || '未知'
}

// 获取ChatType标签类型
const getChatTypeTagType = (type: ChatType): string => {
  if (type === ChatType.WechatPc) return 'primary'
  if ([ChatType.WechatWebHook, ChatType.DingdingWebHook, ChatType.FeishuWebHook].includes(type)) {
    return 'success'
  }
  return 'info'
}

// 获取SignalR状态名称
const getSignalRStateName = (state: SignalRConnectionState): string => {
  const names: Record<SignalRConnectionState, string> = {
    [SignalRConnectionState.Disconnected]: '未连接',
    [SignalRConnectionState.Connecting]: '连接中',
    [SignalRConnectionState.Connected]: '已连接',
    [SignalRConnectionState.Reconnecting]: '重连中',
    [SignalRConnectionState.Failed]: '失败',
  }
  return names[state] || '未知'
}

// 获取SignalR状态标签类型
const getSignalRStateTagType = (state: SignalRConnectionState): string => {
  if (state === SignalRConnectionState.Connected) return 'success'
  if (state === SignalRConnectionState.Connecting || state === SignalRConnectionState.Reconnecting) {
    return 'warning'
  }
  if (state === SignalRConnectionState.Failed) return 'danger'
  return 'info'
}

// 获取连接状态文本（综合在线状态和SignalR状态）
const getConnectionStatusText = (robot: t_chat_push_list, runtimeState: any): string => {
  if (!runtimeState) return '未连接'

  // WechatPc 类型：如果正在检测连接状态
  if (robot.chat_type === ChatType.WechatPc && runtimeState.signalrState === SignalRConnectionState.Connecting) {
    // 如果数据库中标记为离线，说明是在检测状态
    if (!robot.on_line) {
      return '检测中...'
    }
    // 如果数据库中标记为在线，说明是在重连
    return '连接中'
  }

  // 如果数据库中标记为在线，显示已连接
  if (robot.on_line) {
    if (runtimeState.signalrState === SignalRConnectionState.Connected) {
      return '已连接'
    } else {
      // 数据库显示在线，但当前会话未连接（可能是刷新页面后）
      return '已登录'
    }
  }

  return getSignalRStateName(runtimeState.signalrState)
}

// 获取连接状态标签类型（综合判断）
const getConnectionStatusTagType = (robot: t_chat_push_list, runtimeState: any): string => {
  if (!runtimeState) return 'info'

  // 如果数据库中标记为在线，显示成功状态
  if (robot.on_line) {
    if (runtimeState.signalrState === SignalRConnectionState.Connecting) {
      return 'warning'
    }
    return 'success'
  }

  return getSignalRStateTagType(runtimeState.signalrState)
}

// 加载机器人列表
const loadRobotList = async () => {
  try {
    loading.value = true
    const result = await apiManager.chatMgApi.GetPageList(currentPage.value, pageSize.value)

    console.log('机器人列表数据:', result)

    // 注意：API 返回的字段是 rows, total, page, pageSize（不是 Data, Total）
    const robots = result.rows || []
    wechatRobotStore.setRobots(robots)
    total.value = result.total || 0

    console.log('设置机器人列表:', robots.length, '个')

    // 初始化运行时状态
    robots.forEach((robot: t_chat_push_list) => {
      wechatRobotStore.initRuntimeState(robot.id)

      // 如果是 WechatPc 类型，设置为"检测中"状态
      if (robot.chat_type === ChatType.WechatPc) {
        wechatRobotStore.updateSignalRState(robot.id, 1) // Connecting = 检测中
      }
    })

    // 异步检测并重连在线的机器人（不阻塞列表显示）
    autoReconnectOnlineRobots(robots)
  } catch (error) {
    console.error('加载机器人列表失败:', error)
    ElMessage.error('加载机器人列表失败')
  } finally {
    loading.value = false
  }
}

// 自动检测并重连机器人（异步执行，不阻塞列表显示）
const autoReconnectOnlineRobots = (robots: t_chat_push_list[]) => {
  // 筛选所有 WechatPc 类型的机器人（不依赖 on_line 字段）
  // 因为软件关闭时 SignalR 断开，后端会自动将 on_line 设置为 false
  // 所以需要尝试重连所有机器人，检查微信是否还在运行
  const wechatPcRobots = robots.filter(r => r.chat_type === ChatType.WechatPc)

  if (wechatPcRobots.length === 0) {
    console.log('没有需要重连的微信机器人')
    return
  }

  console.log(`发现 ${wechatPcRobots.length} 个微信机器人，开始异步检测连接状态...`)

  // 并行检测所有微信机器人（在后台执行）
  Promise.allSettled(wechatPcRobots.map(robot => checkAndReconnectRobot(robot)))
    .then(results => {
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length
      const failCount = wechatPcRobots.length - successCount

      console.log(`状态检测完成: 成功 ${successCount} 个, 跳过/失败 ${failCount} 个`)

      if (successCount > 0) {
        ElMessage.success({
          message: `成功重连 ${successCount} 个机器人`,
          duration: 2000
        })
      }
    })
    .catch(error => {
      console.error('自动重连过程出错:', error)
    })
}

// 检测并重连单个机器人
// 返回 true 表示成功重连，false 表示跳过或失败
const checkAndReconnectRobot = async (robot: t_chat_push_list): Promise<boolean> => {
  try {
    console.log(`[${robot.name}] 检测连接状态...`)

    // 创建 HTTP 服务客户端（连接微信 Hook 提供的 HTTP 服务）
    const { WxHttpService } = await import('@/services/wechat/WxHttpService')
    const wxHttpService = new WxHttpService({
      host: robot.host,
      port: parseInt(robot.host.split(':').pop() || '19088'),
      timeout: 5000
    })

    // 检查 HTTP 服务是否可用并获取登录状态
    let info
    try {
      info = await wxHttpService.getMyInfo()
    } catch (err) {
      // HTTP 服务不可用，说明微信未运行
      console.log(`[${robot.name}] HTTP 服务不可用，微信可能未运行，断开 SignalR 连接`)

      // 主动断开 SignalR 连接
      await wechatRobotStore.disconnectSignalR(robot.id)

      // 更新数据库状态
      wechatRobotStore.updateRobotOnlineStatus(robot.id, false)

      return false
    }

    const account = info.OtherValues?.account || ''

    if (!account || !info.OffId) {
      console.log(`[${robot.name}] 微信未登录，断开 SignalR 连接`)

      // 主动断开 SignalR 连接
      await wechatRobotStore.disconnectSignalR(robot.id)

      // 更新数据库状态
      wechatRobotStore.updateRobotOnlineStatus(robot.id, false)

      return false
    }

    console.log(`[${robot.name}] 微信已登录 (${account})，开始重连 SignalR...`)

    // 获取 SignalR 服务器地址（后续 SignalR 连接和配置同步都会用到）
    let serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5265'
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        if (localBaseUrlObj && localBaseUrlObj.default) {
          serverUrl = localBaseUrlObj.default
        }
      } catch (error) {
        console.warn('解析 localStorage.baseUrl 失败:', error)
      }
    }

    // 同步配置到主进程（供消息处理器使用）
    try {
      // 尝试从 userStore 获取 token（优先）
      let token = userStore.token || ''
      // 如果 userStore 中没有，尝试从 localStorage 获取
      if (!token) {
        token = localStorage.getItem('token') || ''
      }

      console.log(`[${robot.name}] 同步配置到主进程:`)
      console.log('  baseUrl:', serverUrl)
      console.log('  token存在:', !!token)
      console.log('  token长度:', token ? token.length : 0)

      if (!token) {
        console.warn(`[${robot.name}] ⚠️ Token 为空，消息处理功能可能无法正常工作`)
      }

      await (window as any).electron.ipcRenderer.invoke('update-app-config', {
        baseUrl: serverUrl,
        token: token
      })
      console.log(`[${robot.name}] ✅ 配置已同步到主进程`)
    } catch (error) {
      console.error(`[${robot.name}] ❌ 同步配置到主进程失败:`, error)
    }

    // ==================== 恢复消息接收服务（HTTP Hook 回调） ====================
    try {
      const otherValues: any = robot.OtherValues || {}
      const callbackPort = otherValues.messageCallbackPort

      if (callbackPort && (window as any).electron?.ipcRenderer) {
        console.log(
          `[${robot.name}] 恢复消息服务器，使用上次回调端口: ${callbackPort}`
        )

        const result = await (window as any).electron.ipcRenderer.invoke(
          'wx-start-message-server',
          {
            robotId: robot.id,
            wxHttpPort: parseInt(robot.host.split(':').pop() || '19088'),
            wxHttpHost: robot.host,
            robotInfo: robot,
            fixedPort: callbackPort
          }
        )

        if (!result.success) {
          console.warn(
            `[${robot.name}] 恢复消息服务器失败（端口监听可能未成功），但仍将重置 Hook 回调:`,
            result.error || '未知错误'
          )
        } else {
          console.log(
            `[${robot.name}] 消息服务器恢复成功，端口: ${result.port}`
          )
        }

        // 无论本地端口监听是否成功，都再次调用一次 type=9，使用同一个回调端口
        // 这样即便微信进程曾经退出重启，Hook 配置也会被重新写入
        try {
          await wxHttpService.startChat({
            port: callbackPort,
            ip: '127.0.0.1',
            url: `http://localhost:${callbackPort}`,
            timeout: '/webhook',
            enableHttp: 0
          })
          console.log(
            `[${robot.name}] 已重新设置微信 Hook 回调 (type=9)，端口: ${callbackPort}`
          )
        } catch (err2: any) {
          // 重复设置同一个端口时，微信可能返回失败，这里只记录告警不阻断
          console.warn(
            `[${robot.name}] 重新设置 Hook 回调失败（可能已设置过）:`,
            err2?.message || err2
          )
        }
      } else {
        console.log(
          `[${robot.name}] 未找到已保存的回调端口（messageCallbackPort），跳过消息服务器恢复`
        )
      }
    } catch (err) {
      console.warn(`[${robot.name}] 恢复消息接收服务失败:`, err)
    }
    // =======================================================================

    // 更新状态为连接中
    wechatRobotStore.updateSignalRState(robot.id, 1) // Connecting

    // 创建并连接 SignalR（serverUrl 已在上面获取）
    const { SignalRClientManager } = await import('@/services/wechat/SignalRClientManager')
    const signalRManager = new SignalRClientManager(
      { serverUrl },
      wxHttpService,
      robot
    )

    await signalRManager.connect()

    // 更新状态（SignalR 连接成功后，后端会自动将 on_line 设置为 true）
    wechatRobotStore.updateSignalRState(robot.id, 2) // Connected
    wechatRobotStore.updateChatInfo(robot.id, info)
    wechatRobotStore.updateRobotOnlineStatus(robot.id, true) // 更新前端状态

    // 保存 signalRManager 引用以便后续管理
    wechatRobotStore.setSignalRManager(robot.id, signalRManager)

    // 可选：获取联系人列表
    try {
      const friends = await wxHttpService.getFriendList()
      const groups = await wxHttpService.getGroupList()
      wechatRobotStore.updateFriends(robot.id, friends)
      wechatRobotStore.updateGroups(robot.id, groups)
    } catch (err) {
      console.warn(`[${robot.name}] 获取联系人失败:`, err)
    }

    console.log(`[${robot.name}] 重连成功！`)
    return true
  } catch (error: any) {
    console.error(`[${robot.name}] 重连失败:`, error.message)
    wechatRobotStore.updateSignalRState(robot.id, 0) // Disconnected
    return false
  }
}

// 处理添加机器人
const handleAddRobot = () => {
  emit('add')
}

// 处理刷新
const handleRefresh = () => {
  loadRobotList()
}

// 处理连接
const handleConnect = (robot: t_chat_push_list) => {
  emit('connect', robot)
}

// 处理断开
const handleDisconnect = async (robot: t_chat_push_list) => {
  try {
    await ElMessageBox.confirm(
      `确定要断开机器人"${robot.name}"的连接吗？`,
      '确认断开',
      {
        type: 'warning',
      }
    )
    emit('disconnect', robot)
  } catch {
    // 用户取消
  }
}

// 处理查看管理员列表
const handleViewManagers = (robot: t_chat_push_list) => {
  selectedRobot.value = robot
  managerDialogVisible.value = true
}

// 处理删除
const handleDelete = async (robot: t_chat_push_list) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除机器人"${robot.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      }
    )

    const loadingMsg = ElMessage({
      message: '正在删除...',
      type: 'info',
      duration: 0,
    })

    try {
      console.log(`[删除] 开始删除机器人: ${robot.name} (${robot.id})`)

      // 1. 如果是WechatPc类型且在线，先断开SignalR连接
      if (robot.chat_type === ChatType.WechatPc && robot.on_line) {
        console.log(`[删除] 正在断开SignalR连接...`)
        await wechatRobotStore.disconnectSignalR(robot.id)
      }

      // 2. 停止消息服务器
      if (robot.chat_type === ChatType.WechatPc) {
        try {
          console.log(`[删除] 正在停止消息服务器...`)
          await window.electron.ipcRenderer.invoke('wx-stop-message-server', robot.id)
          console.log(`[删除] 消息服务器已停止`)
        } catch (err) {
          console.warn('[删除] 停止消息服务器失败:', err)
        }
      }

      // 3. 调用后端API删除机器人
      console.log(`[删除] 正在调用后端API删除...`)
      await apiManager.chatMgApi.DeleteChatBot(robot.id)
      console.log(`[删除] 后端删除成功`)

      // 4. 从本地store移除
      wechatRobotStore.removeRobot(robot.id)
      console.log(`[删除] 本地store已清理`)

      loadingMsg.close()
      ElMessage.success('删除成功')

      // 5. 重新加载列表
      await loadRobotList()
    } catch (error: any) {
      loadingMsg.close()
      console.error('[删除] 删除过程失败:', error)
      throw error
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('[删除] 删除失败:', error)
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

// 处理分页大小变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadRobotList()
}

// 处理页码变化
const handleCurrentChange = () => {
  loadRobotList()
}

// 初始化
onMounted(() => {
  loadRobotList()
})
</script>

<style scoped lang="scss">
.robot-list-container {
  padding: 20px;
}

.list-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.robot-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .info-text {
    flex: 1;

    .name {
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .offid {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.contact-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-item {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}

.text-secondary {
  color: var(--el-text-color-secondary);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
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