/**
 * 微信机器人状态管理
 * 管理机器人列表、连接状态、联系人数据等
 */

import { defineStore } from 'pinia'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { ChatInfo } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatInfo'
import { ChatMemberItem } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import {
  SignalRConnectionState,
  WxProcessState,
  ConnectProgress,
  ConnectStep,
} from '@/types/wechat'

/**
 * 机器人运行时状态
 */
interface RobotRuntimeState {
  /** 机器人ID */
  robotId: string
  /** SignalR连接状态 */
  signalrState: SignalRConnectionState
  /** 微信进程状态 */
  processState: WxProcessState
  /** 账号信息 */
  chatInfo: ChatInfo | null
  /** 好友列表 */
  friends: ChatMemberItem[]
  /** 群列表 */
  groups: ChatMemberItem[]
  /** 最后更新时间 */
  lastUpdateTime: number
  /** 错误信息 */
  error: string | null
  /** SignalR管理器实例 */
  signalRManager?: any
}

/**
 * Store State类型
 */
interface WechatRobotState {
  /** 机器人列表 */
  robots: t_chat_push_list[]
  /** 运行时状态映射 robotId -> RuntimeState */
  runtimeStates: Map<string, RobotRuntimeState>
  /** 当前连接进度 */
  connectProgress: ConnectProgress | null
  /** 当前操作的机器人ID */
  currentRobotId: string | null
}

export const useWechatRobotStore = defineStore('wechatRobot', {
  state: (): WechatRobotState => ({
    robots: [],
    runtimeStates: new Map(),
    connectProgress: null,
    currentRobotId: null,
  }),

  getters: {
    /**
     * 获取所有机器人
     */
    getAllRobots: (state) => state.robots,

    /**
     * 根据ID获取机器人
     */
    getRobotById: (state) => (id: string) => {
      return state.robots.find((r) => r.id === id)
    },

    /**
     * 获取在线机器人数量
     */
    getOnlineRobotCount: (state) => {
      return state.robots.filter((r) => r.on_line).length
    },

    /**
     * 根据ChatType过滤机器人
     */
    getRobotsByType: (state) => (type: ChatType) => {
      return state.robots.filter((r) => r.chat_type === type)
    },

    /**
     * 获取机器人运行时状态
     */
    getRuntimeState: (state) => (robotId: string) => {
      return state.runtimeStates.get(robotId)
    },

    /**
     * 获取当前机器人
     */
    getCurrentRobot: (state) => {
      if (!state.currentRobotId) return null
      return state.robots.find((r) => r.id === state.currentRobotId)
    },

    /**
     * 获取当前连接进度
     */
    getConnectProgress: (state) => state.connectProgress,
  },

  actions: {
    /**
     * 设置机器人列表
     */
    setRobots(robots: t_chat_push_list[]) {
      this.robots = robots
    },

    /**
     * 添加机器人
     */
    addRobot(robot: t_chat_push_list) {
      const index = this.robots.findIndex((r) => r.id === robot.id)
      if (index >= 0) {
        // 更新现有机器人
        this.robots[index] = robot
      } else {
        // 添加新机器人
        this.robots.push(robot)
      }
    },

    /**
     * 移除机器人
     */
    removeRobot(robotId: string) {
      const index = this.robots.findIndex((r) => r.id === robotId)
      if (index >= 0) {
        this.robots.splice(index, 1)
      }
      // 清除运行时状态
      this.runtimeStates.delete(robotId)
    },

    /**
     * 更新机器人在线状态
     */
    updateRobotOnlineStatus(robotId: string, onLine: boolean) {
      const robot = this.robots.find((r) => r.id === robotId)
      if (robot) {
        robot.on_line = onLine
      }
    },

    /**
     * 初始化机器人运行时状态
     */
    initRuntimeState(robotId: string) {
      if (!this.runtimeStates.has(robotId)) {
        this.runtimeStates.set(robotId, {
          robotId,
          signalrState: SignalRConnectionState.Disconnected,
          processState: 0, // WxProcessState.NotStarted
          chatInfo: null,
          friends: [],
          groups: [],
          lastUpdateTime: Date.now(),
          error: null,
        })
      }
    },

    /**
     * 更新运行时状态
     */
    updateRuntimeState(
      robotId: string,
      updates: Partial<Omit<RobotRuntimeState, 'robotId'>>
    ) {
      const state = this.runtimeStates.get(robotId)
      if (state) {
        Object.assign(state, updates, { lastUpdateTime: Date.now() })
      }
    },

    /**
     * 更新SignalR连接状态
     */
    updateSignalRState(robotId: string, state: SignalRConnectionState) {
      this.updateRuntimeState(robotId, { signalrState: state })
    },

    /**
     * 更新进程状态
     */
    updateProcessState(robotId: string, state: WxProcessState) {
      this.updateRuntimeState(robotId, { processState: state })
    },

    /**
     * 更新账号信息
     */
    updateChatInfo(robotId: string, chatInfo: ChatInfo) {
      this.updateRuntimeState(robotId, { chatInfo })
    },

    /**
     * 更新好友列表
     */
    updateFriends(robotId: string, friends: ChatMemberItem[]) {
      this.updateRuntimeState(robotId, { friends })
    },

    /**
     * 更新群列表
     */
    updateGroups(robotId: string, groups: ChatMemberItem[]) {
      this.updateRuntimeState(robotId, { groups })
    },

    /**
     * 设置错误信息
     */
    setError(robotId: string, error: string | null) {
      this.updateRuntimeState(robotId, { error })
    },

    /**
     * 清除错误信息
     */
    clearError(robotId: string) {
      this.setError(robotId, null)
    },

    /**
     * 设置当前机器人ID
     */
    setCurrentRobotId(robotId: string | null) {
      this.currentRobotId = robotId
    },

    /**
     * 设置连接进度
     */
    setConnectProgress(progress: ConnectProgress | null) {
      this.connectProgress = progress
    },

    /**
     * 更新连接步骤
     */
    updateConnectStep(
      step: ConnectStep,
      message: string,
      options?: {
        canCancel?: boolean
        error?: string
        downloadProgress?: any
      }
    ) {
      this.connectProgress = {
        step,
        message,
        canCancel: options?.canCancel ?? true,
        error: options?.error,
        downloadProgress: options?.downloadProgress,
      }
    },

    /**
     * 清除连接进度
     */
    clearConnectProgress() {
      this.connectProgress = null
    },

    /**
     * 设置SignalR管理器
     */
    setSignalRManager(robotId: string, manager: any) {
      this.updateRuntimeState(robotId, { signalRManager: manager })
    },

    /**
     * 获取SignalR管理器
     */
    getSignalRManager(robotId: string): any {
      const state = this.runtimeStates.get(robotId)
      return state?.signalRManager
    },

    /**
     * 断开SignalR连接
     */
    async disconnectSignalR(robotId: string) {
      const manager = this.getSignalRManager(robotId)
      if (manager) {
        try {
          await manager.disconnect()
          console.log(`[Store] 已断开机器人 ${robotId} 的 SignalR 连接`)
        } catch (error) {
          console.error(`[Store] 断开机器人 ${robotId} 的 SignalR 连接失败:`, error)
        }
        // 清除管理器引用
        this.updateRuntimeState(robotId, { signalRManager: undefined })
      }
      // 更新状态
      this.updateSignalRState(robotId, SignalRConnectionState.Disconnected)
    },

    /**
     * 重置所有状态
     */
    reset() {
      this.robots = []
      this.runtimeStates.clear()
      this.connectProgress = null
      this.currentRobotId = null
    },
  },
})
