<template>
  <div class="robot-management-page">
    <el-page-header @back="handleGoBack">
      <template #content>
        <span class="page-title">微信机器人管理</span>
      </template>
    </el-page-header>

    <div class="page-content">
      <RobotList @add="handleAddRobot" @connect="handleConnectRobot" @disconnect="handleDisconnectRobot" />
    </div>

    <!-- 添加机器人对话框 -->
    <AddRobotDialog
      v-model:visible="addDialogVisible"
      @connect="handleStartConnect"
      @success="handleAddSuccess"
      @cancel="handleCancelConnect"
      @confirm-login="handleUserConfirmLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RobotList from './components/RobotList.vue'
import AddRobotDialog from './components/AddRobotDialog.vue'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { useWechatRobotStore } from '@/store/modules/wechatRobot'
import { useUserStore } from '@/store/modules/user'
import { WxWorkPackageManager } from '@/services/wechat/WxWorkPackageManager'
import { WxHttpService } from '@/services/wechat/WxHttpService'
import { SignalRClientManager } from '@/services/wechat/SignalRClientManager'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { ConnectStep } from '@/types/wechat'

const router = useRouter()
const wechatRobotStore = useWechatRobotStore()
const userStore = useUserStore()

const addDialogVisible = ref(false)

// 当前管理器实例
let workPackageManager: WxWorkPackageManager | null = null
let wxHttpService: WxHttpService | null = null
let signalRManager: SignalRClientManager | null = null

// 取消标志
let isCancelling = false

// 登录确认 Promise resolver
let loginConfirmResolver: (() => void) | null = null

// 检查是否是 Webhook 类型
const isWebhookType = (chatType: ChatType): boolean => {
  return [ChatType.WechatWebHook, ChatType.DingdingWebHook, ChatType.FeishuWebHook].includes(chatType)
}

// 返回上一页
const handleGoBack = () => {
  router.back()
}

// 调试方法：打印所有消息服务器状态
const debugPrintMessageServers = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('wx-print-message-servers')
    console.log('打印消息服务器状态:', result)

    const serversResult = await window.electron.ipcRenderer.invoke('wx-get-message-servers')
    if (serversResult.success) {
      console.log('运行中的消息服务器:', serversResult.servers)
      return serversResult.servers
    }
  } catch (error) {
    console.error('获取消息服务器状态失败:', error)
  }
}

// 调试方法：测试消息服务器
const debugTestMessageServer = async (port: number) => {
  try {
    const testUrl = `http://127.0.0.1:${port}/test`
    console.log(`测试消息服务器: ${testUrl}`)

    const response = await fetch(testUrl)
    const data = await response.json()
    console.log('测试响应:', data)
    ElMessage.success(`消息服务器测试成功！端口: ${port}`)
    return data
  } catch (error) {
    console.error('测试消息服务器失败:', error)
    ElMessage.error(`消息服务器测试失败！端口: ${port}`)
  }
}

// 暴露调试方法到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  ;(window as any).debugWxMessageServer = {
    printServers: debugPrintMessageServers,
    testServer: debugTestMessageServer,
    help: () => {
      console.log(`
╔════════════════════════════════════════════════════════════════
║ 微信消息服务器调试工具
╠════════════════════════════════════════════════════════════════
║ 可用命令：
║
║ 1. debugWxMessageServer.printServers()
║    - 打印所有运行中的消息服务器状态
║
║ 2. debugWxMessageServer.testServer(port)
║    - 测试指定端口的消息服务器
║    - 示例: debugWxMessageServer.testServer(19099)
║
║ 3. debugWxMessageServer.help()
║    - 显示此帮助信息
║
╚════════════════════════════════════════════════════════════════
      `)
    }
  }

  console.log('💡 微信消息服务器调试工具已加载！输入 debugWxMessageServer.help() 查看帮助')
}

// 处理添加机器人
const handleAddRobot = () => {
  addDialogVisible.value = true
}

// 处理添加成功
const handleAddSuccess = (robot: t_chat_push_list) => {
  wechatRobotStore.addRobot(robot)
  ElMessage.success('机器人添加成功')
}

// 开始连接流程
const handleStartConnect = async (chatType: ChatType) => {
  if (chatType !== ChatType.WechatPc) {
    ElMessage.warning('暂不支持此类型机器人的连接')
    return
  }

  try {
    // 重置取消标志
    isCancelling = false

    // 初始化工作包管理器
    workPackageManager = new WxWorkPackageManager()

    // 步骤1: 准备工作包
    wechatRobotStore.updateConnectStep(ConnectStep.PreparePackage, '正在检查工作包...', { canCancel: true })

    console.log('[RobotManagement] 开始准备工作包，设置进度回调')

    const workDir = await workPackageManager.prepareWorkPackage(progress => {
      console.log('[RobotManagement] 进度回调被调用:', progress)

      // 步骤2: 下载工作包
      wechatRobotStore.updateConnectStep(ConnectStep.DownloadPackage, '正在下载工作包...', {
        canCancel: true,
        downloadProgress: progress
      })

      console.log('[RobotManagement] 已更新 store 进度')
    })

    console.log('[RobotManagement] 工作包准备完成')

    // 步骤3: 解压完成
    wechatRobotStore.updateConnectStep(ConnectStep.ExtractPackage, '工作包准备完成', { canCancel: false })

    // 步骤4: 启动微信客户端
    wechatRobotStore.updateConnectStep(ConnectStep.StartWechat, '正在启动微信客户端...', { canCancel: false })

    const { port: httpPort } = await workPackageManager.startWechatProcess()
    workPackageManager.setProcessState(3) // WaitingForScan

    console.log('微信HTTP服务端口:', httpPort)

    // 创建 HTTP 服务实例（使用分配的端口）
    wxHttpService = new WxHttpService({
      host: `http://127.0.0.1:${httpPort}`,
      port: httpPort,
      timeout: 10000
    })

    // 步骤5: 等待扫码登录（不再检测HTTP服务，避免未登录时调用导致崩溃）
    wechatRobotStore.updateConnectStep(ConnectStep.WaitingScan, '请使用手机微信扫码登录', { canCancel: true })

    console.log('等待用户扫码并确认登录...')

    // 等待微信登录成功
    await waitForWechatLogin()

    // 步骤6: 同步账号信息
    wechatRobotStore.updateConnectStep(ConnectStep.SyncAccountInfo, '正在同步账号信息...', { canCancel: false })

    // 启动聊天Hook服务
    await wxHttpService.startChat()

    // 获取个人信息
    const chatInfo = await wxHttpService.getMyInfo()

    // 保存到后端
    const robot = await apiManager.chatMgApi.UpdateChatInfo({
      id: '', // 新建时为空，后端会自动生成
      admin: userStore.username || userStore.userId || '', // 当前用户
      chat_type: ChatType.WechatPc,
      host: `http://127.0.0.1:${httpPort}`, // 使用动态分配的端口
      head_img: chatInfo.HeadImg || '',
      name: chatInfo.Name,
      offid: chatInfo.OffId,
      on_line: true,
      key: '', // 后端会生成
      MannagerOffIds: [],
      OtherValues: chatInfo.OtherValues,
      avtag: true, // 可用状态
      notes: `微信PC客户端 - ${chatInfo.Name}`, // 备注
      ExTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 过期时间：1年后
      crtim: new Date(), // 创建时间
      uptim: new Date() // 更新时间
    } as t_chat_push_list)

    // 步骤7: 建立SignalR连接
    wechatRobotStore.updateConnectStep(ConnectStep.ConnectSignalR, '正在建立SignalR连接...', { canCancel: false })

    // 获取 SignalR 服务器地址（参考 ApiManager 的做法）
    let serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5265'
    const localBaseUrl = localStorage.getItem('baseUrl')
    if (localBaseUrl) {
      try {
        const localBaseUrlObj = JSON.parse(localBaseUrl)
        // 登录页写入的格式：{ default: 'http://xxx' }
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

      console.log('同步配置到主进程:')
      console.log('  baseUrl:', serverUrl)
      console.log('  token存在:', !!token)
      console.log('  token长度:', token ? token.length : 0)

      if (!token) {
        console.warn('⚠️ Token 为空，消息处理功能可能无法正常工作')
      }

      await window.electron.ipcRenderer.invoke('update-app-config', {
        baseUrl: serverUrl,
        token: token
      })
      console.log('✅ 配置已同步到主进程')
    } catch (error) {
      console.error('❌ 同步配置到主进程失败:', error)
    }

    // 创建SignalR管理器
    signalRManager = new SignalRClientManager({ serverUrl }, wxHttpService, robot)

    // 更新 SignalR 连接状态：连接中
    wechatRobotStore.updateSignalRState(robot.id, 1) // SignalRConnectionState.Connecting

    await signalRManager.connect()

    // 更新 SignalR 连接状态：已连接
    wechatRobotStore.updateSignalRState(robot.id, 2) // SignalRConnectionState.Connected
    // 保存 SignalR 管理器实例
    wechatRobotStore.setSignalRManager(robot.id, signalRManager)
    console.log('SignalR 连接成功')

    // 步骤7.5: 启动消息接收服务
    wechatRobotStore.updateConnectStep(ConnectStep.ConnectSignalR, '正在启动消息接收服务...', { canCancel: false })

    try {
      // 请求主进程启动HTTP服务器（首次连接，不指定固定端口，由主进程自动分配）
      const messageServerResult = await window.electron.ipcRenderer.invoke('wx-start-message-server', {
        robotId: robot.id,
        wxHttpPort: httpPort,
        wxHttpHost: `http://127.0.0.1:${httpPort}`,
        robotInfo: robot
      })

      if (!messageServerResult.success) {
        throw new Error(messageServerResult.error || '启动消息服务器失败')
      }

      const callbackPort = messageServerResult.port
      console.log(`\n✅ 消息服务器已启动！`)
      console.log(`   监听端口: ${callbackPort}`)
      console.log(`   测试地址: http://127.0.0.1:${callbackPort}/test`)
      console.log(`   测试命令: debugWxMessageServer.testServer(${callbackPort})`)
      console.log(`   查看所有: debugWxMessageServer.printServers()\n`)

      // 调用微信HTTP服务设置hook回调
      await wxHttpService.startChat({
        port: callbackPort,
        ip: '127.0.0.1',
        url: `http://localhost:${callbackPort}`,
        timeout: '/webhook',
        enableHttp: 0
      })

      console.log('✅ 微信Hook回调已设置')
      console.log(`   回调地址: http://localhost:${callbackPort}/webhook`)

      // 将回调端口保存到机器人配置中，便于软件重启后恢复同一端口
      try {
        const otherValues = (robot.OtherValues || {}) as any
        otherValues.messageCallbackPort = callbackPort
        robot.OtherValues = otherValues

        console.log('[RobotManagement] 保存消息回调端口到机器人配置:', callbackPort)
        await apiManager.chatMgApi.UpdateChatInfo(robot as t_chat_push_list)
      } catch (err) {
        console.warn('[RobotManagement] 保存消息回调端口失败:', err)
      }
    } catch (error) {
      console.error('启动消息服务失败:', error)
      // 不阻断连接流程，只记录错误
      ElMessage.warning('消息接收服务启动失败，但机器人已连接')
    }

    // 步骤8: 同步联系人数据
    wechatRobotStore.updateConnectStep(ConnectStep.SyncContacts, '正在同步联系人数据...', { canCancel: false })

    const friends = await wxHttpService.getFriendList()
    const groups = await wxHttpService.getGroupList()

    // 更新状态
    wechatRobotStore.addRobot(robot)
    wechatRobotStore.initRuntimeState(robot.id)
    wechatRobotStore.updateChatInfo(robot.id, chatInfo)
    wechatRobotStore.updateFriends(robot.id, friends)
    wechatRobotStore.updateGroups(robot.id, groups)

    // 步骤9: 完成
    wechatRobotStore.updateConnectStep(ConnectStep.Completed, '连接成功！', { canCancel: false })
  } catch (error) {
    console.error('连接失败:', error)
    const errorMsg = error instanceof Error ? error.message : '连接失败'

    // 更新 SignalR 连接状态：失败
    if (workPackageManager) {
      const robotId = wechatRobotStore.robots[wechatRobotStore.robots.length - 1]?.id
      if (robotId) {
        wechatRobotStore.updateSignalRState(robotId, 4) // SignalRConnectionState.Failed
      }
    }

    wechatRobotStore.updateConnectStep(
      wechatRobotStore.connectProgress?.step || 0,
      wechatRobotStore.connectProgress?.message || '',
      { error: errorMsg, canCancel: false }
    )

    // 清理资源
    await cleanup()
  }
}

// 等待微信登录（等待用户点击"我已登陆"按钮）
const waitForWechatLogin = async () => {
  return new Promise<void>((resolve, reject) => {
    console.log('等待用户点击"我已登陆"按钮...')

    // 创建一个定时检查取消标志的定时器
    const cancelCheckInterval = setInterval(() => {
      if (isCancelling) {
        console.log('检测到用户取消')
        clearInterval(cancelCheckInterval)
        loginConfirmResolver = null
        reject(new Error('用户已取消连接'))
      }
    }, 500)

    // 设置登录确认 resolver
    loginConfirmResolver = () => {
      console.log('用户已确认登录')
      clearInterval(cancelCheckInterval)
      resolve()
    }
  })
}

// 处理用户确认登录
const handleUserConfirmLogin = () => {
  console.log('用户确认已登录')
  if (loginConfirmResolver) {
    loginConfirmResolver()
    loginConfirmResolver = null
  }
}

// 取消连接
const handleCancelConnect = async () => {
  console.log('用户取消连接')
  isCancelling = true

  // 如果正在下载，取消下载
  if (workPackageManager) {
    try {
      await workPackageManager.cancelDownload()
      console.log('已取消下载')
    } catch (error) {
      console.error('取消下载失败:', error)
    }
  }

  // 如果有等待登录确认的 Promise，也拒绝它
  if (loginConfirmResolver) {
    loginConfirmResolver = null
  }

  // 清理资源
  await cleanup()

  // 询问用户是否手动导入
  const result = await ElMessageBox.confirm(
    '下载已取消。您可以手动选择本地的微信工作包（WeChat.zip）继续安装。',
    '提示',
    {
      confirmButtonText: '选择本地文件',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).catch(() => 'cancel')

  if (result === 'confirm') {
    // 用户选择手动导入
    try {
      console.log('用户选择手动导入工作包')

      // 重置取消标志
      isCancelling = false

      // 重新初始化工作包管理器
      workPackageManager = new WxWorkPackageManager()

      // 更新进度状态
      wechatRobotStore.updateConnectStep(ConnectStep.PreparePackage, '正在导入工作包...', { canCancel: false })

      // 手动导入工作包（会弹出文件选择对话框）
      const workDir = await workPackageManager.importWorkPackage()

      console.log('工作包导入成功:', workDir)

      // 继续后续流程（从步骤3开始）
      wechatRobotStore.updateConnectStep(ConnectStep.ExtractPackage, '工作包准备完成', { canCancel: false })

      // 重新进入连接流程
      await continueConnectAfterWorkPackage(workDir)
    } catch (error) {
      console.error('手动导入失败:', error)
      const errorMsg = error instanceof Error ? error.message : '导入失败'

      if (errorMsg !== '用户取消选择') {
        ElMessage.error(errorMsg)
      }

      wechatRobotStore.clearConnectProgress()
    }
  } else {
    ElMessage.info('已取消连接')
  }
}

// 导入工作包后继续连接流程
const continueConnectAfterWorkPackage = async (workDir: string) => {
  try {
    // 步骤4: 启动微信客户端
    wechatRobotStore.updateConnectStep(ConnectStep.StartWechat, '正在启动微信客户端...', { canCancel: false })

    const { port: httpPort } = await workPackageManager!.startWechatProcess()
    workPackageManager!.setProcessState(3) // WaitingForScan

    console.log('微信HTTP服务端口:', httpPort)

    // 创建 HTTP 服务实例
    wxHttpService = new WxHttpService({
      host: `http://127.0.0.1:${httpPort}`,
      port: httpPort,
      timeout: 10000
    })

    // 步骤5: 等待扫码登录
    wechatRobotStore.updateConnectStep(ConnectStep.WaitingScan, '请使用手机微信扫码登录', { canCancel: true })

    console.log('等待用户扫码并确认登录...')

    // 等待微信登录成功
    await waitForWechatLogin()

    // 步骤6: 同步账号信息
    wechatRobotStore.updateConnectStep(ConnectStep.SyncAccountInfo, '正在同步账号信息...', { canCancel: false })

    // 启动聊天Hook服务
    await wxHttpService.startChat()

    // 获取个人信息
    const chatInfo = await wxHttpService.getMyInfo()

    // 保存到后端
    const robot = await apiManager.chatMgApi.UpdateChatInfo({
      id: '',
      admin: userStore.username || userStore.userId || '',
      chat_type: ChatType.WechatPc,
      host: `http://127.0.0.1:${httpPort}`,
      head_img: chatInfo.HeadImg || '',
      name: chatInfo.Name,
      offid: chatInfo.OffId,
      on_line: true,
      key: '',
      MannagerOffIds: [],
      OtherValues: chatInfo.OtherValues,
      avtag: true,
      notes: `微信PC客户端 - ${chatInfo.Name}`,
      ExTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      crtim: new Date(),
      uptim: new Date()
    } as t_chat_push_list)

    // 步骤7: 建立SignalR连接
    wechatRobotStore.updateConnectStep(ConnectStep.ConnectSignalR, '正在建立SignalR连接...', { canCancel: false })

    // 获取 SignalR 服务器地址
    let serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5265'
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      serverUrl = `http://${serverUrl}`
    }

    // 创建SignalR管理器
    signalRManager = new SignalRClientManager({ serverUrl }, wxHttpService, robot)

    // 更新 SignalR 连接状态：连接中
    wechatRobotStore.updateSignalRState(robot.id, 1) // SignalRConnectionState.Connecting

    await signalRManager.connect()

    // 更新 SignalR 连接状态：已连接
    wechatRobotStore.updateSignalRState(robot.id, 2) // SignalRConnectionState.Connected
    // 保存 SignalR 管理器实例
    wechatRobotStore.setSignalRManager(robot.id, signalRManager)
    console.log('SignalR 连接成功')

    // 启动消息服务
    try {
      const messageServerResult = await window.electron.ipcRenderer.invoke('wx-start-message-server', {
        robotId: robot.id,
        wxHttpHost: '127.0.0.1',
        wxHttpPort: httpPort,
        robotInfo: robot
      })

      if (!messageServerResult.success) {
        throw new Error(messageServerResult.error || '启动消息服务器失败')
      }

      const callbackPort = messageServerResult.port
      console.log(`消息服务器已启动，端口: ${callbackPort}`)

      // 设置微信消息回调
      await wxHttpService.startChat({
        port: callbackPort,
        ip: '127.0.0.1',
        enableHttp: 1
      })

      try {
        const otherValues = (robot.OtherValues || {}) as any
        otherValues.messageCallbackPort = callbackPort
        robot.OtherValues = otherValues

        console.log('[RobotManagement] 保存消息回调端口到机器人配置:', callbackPort)
        await apiManager.chatMgApi.UpdateChatInfo(robot as t_chat_push_list)
      } catch (err) {
        console.warn('[RobotManagement] 保存消息回调端口失败:', err)
      }
    } catch (error) {
      console.error('启动消息服务失败:', error)
      ElMessage.warning('消息接收服务启动失败，但机器人已连接')
    }

    // 步骤8: 同步联系人数据
    wechatRobotStore.updateConnectStep(ConnectStep.SyncContacts, '正在同步联系人数据...', { canCancel: false })

    const friends = await wxHttpService.getGroupList()
    const groups = await wxHttpService.getGroupList()

    // 更新状态
    wechatRobotStore.addRobot(robot)
    wechatRobotStore.initRuntimeState(robot.id)
    wechatRobotStore.updateChatInfo(robot.id, chatInfo)
    wechatRobotStore.updateFriends(robot.id, friends)
    wechatRobotStore.updateGroups(robot.id, groups)

    // 步骤9: 完成
    wechatRobotStore.updateConnectStep(ConnectStep.Completed, '连接成功！', { canCancel: false })
  } catch (error) {
    console.error('连接失败:', error)
    const errorMsg = error instanceof Error ? error.message : '连接失败'

    wechatRobotStore.updateConnectStep(
      wechatRobotStore.connectProgress?.step || 0,
      wechatRobotStore.connectProgress?.message || '',
      { error: errorMsg, canCancel: false }
    )

    await cleanup()
  }
}

// 处理连接机器人
const handleConnectRobot = async (robot: t_chat_push_list) => {
  if (isWebhookType(robot.chat_type)) {
    // Webhook 类型直接更新在线状态
    try {
      console.log(`[${robot.name}] Webhook 类型机器人，更新在线状态`)

      // 调用 API 更新后端状态
      const updatedRobot = await apiManager.chatMgApi.UpdateChatInfo({
        ...robot,
        on_line: true,
        uptim: new Date() // 更新时间
      })

      // 更新 store 中的机器人信息
      wechatRobotStore.addRobot(updatedRobot)

      ElMessage.success('连接成功')
    } catch (error: any) {
      console.error(`[${robot.name}] 连接失败:`, error)
      ElMessage.error(error?.message || '连接失败')
    }
  } else {
    // WechatPc 类型走原来的连接流程
    wechatRobotStore.setCurrentRobotId(robot.id)
    handleStartConnect(robot.chat_type)
  }
}

// 处理断开机器人
const handleDisconnectRobot = async (robot: t_chat_push_list) => {
  try {
    console.log('开始断开机器人:', robot.name)

    if (isWebhookType(robot.chat_type)) {
      // Webhook 类型直接更新离线状态
      console.log(`[${robot.name}] Webhook 类型机器人，更新离线状态`)

      // 调用 API 更新后端状态
      const updatedRobot = await apiManager.chatMgApi.UpdateChatInfo({
        ...robot,
        on_line: false,
        uptim: new Date() // 更新时间
      })

      // 更新 store 中的机器人信息
      wechatRobotStore.addRobot(updatedRobot)
    } else {
      // WechatPc 类型需要断开 SignalR 和停止进程
      // 使用 store 的方法断开 SignalR 连接（会自动更新状态）
      await wechatRobotStore.disconnectSignalR(robot.id)

      // 停止消息服务器
      try {
        await window.electron.ipcRenderer.invoke('wx-stop-message-server', robot.id)
        console.log(`消息服务器已停止: ${robot.id}`)
      } catch (err) {
        console.warn('停止消息服务器失败:', err)
      }

      // 如果是当前正在操作的机器人，也停止微信进程
      if (workPackageManager && wechatRobotStore.currentRobotId === robot.id) {
        await workPackageManager?.stopWechatProcess()
      }

      // 更新数据库中的在线状态
      wechatRobotStore.updateRobotOnlineStatus(robot.id, false)

      // 调用 API 更新后端状态
      await apiManager.chatMgApi.UpdateChatInfo({
        ...robot,
        on_line: false
      })
    }

    console.log('断开成功')
    ElMessage.success('断开成功')
  } catch (error) {
    console.error('断开失败:', error)
    wechatRobotStore.updateSignalRState(robot.id, 4) // SignalRConnectionState.Failed
    ElMessage.error('断开失败')
  }
}

// 清理资源
const cleanup = async () => {
  try {
    console.log('开始清理资源...')

    // 停止消息服务器
    if (wechatRobotStore.currentRobotId) {
      try {
        await window.electron.ipcRenderer.invoke('wx-stop-message-server', wechatRobotStore.currentRobotId)
        console.log('消息服务器已停止')
      } catch (err) {
        console.warn('停止消息服务器失败:', err)
      }
    }

    // 断开 SignalR
    if (signalRManager) {
      await signalRManager.disconnect()
      signalRManager = null
    }

    // 停止微信进程并清理工作包
    if (workPackageManager) {
      try {
        await workPackageManager.stopWechatProcess()
      } catch (err) {
        console.warn('停止微信进程失败:', err)
      }

      await workPackageManager.cleanup()
      workPackageManager = null
    }

    wxHttpService = null

    console.log('资源清理完成')
  } catch (error) {
    console.error('清理资源失败:', error)
  }
}
</script>

<style scoped lang="scss">
.robot-management-page {
  padding: 20px;
  background-color: var(--el-bg-color);
  min-height: 100vh;

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .page-content {
    margin-top: 24px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);
  }
}
</style>
