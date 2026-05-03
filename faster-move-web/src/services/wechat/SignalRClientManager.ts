/**
 * SignalR客户端管理器
 * 基于 docs/ChatClient_SignalR对接文档.md
 * 管理与后端SignalR Hub的连接和通信
 */

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { ChatInfo } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatInfo'
import { ChatMemberItem } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import { ChatMemberPageRequest } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageRequest'
import { ChatMemberPageResult } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageResult'
import { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import { SignalRConnectionState } from '@/types/wechat'
import type { WxHttpService } from './WxHttpService'

/**
 * SignalR连接配置
 */
interface SignalRConfig {
  /** 服务器URL */
  serverUrl: string
  /** 自动重连间隔（毫秒） */
  reconnectDelays?: number[]
  /** 日志级别 */
  logLevel?: LogLevel
}

/**
 * SignalR客户端管理器
 */
export class SignalRClientManager {
  private connection: HubConnection | null = null
  private config: SignalRConfig
  private wxHttpService: WxHttpService
  private chatInfo: t_chat_push_list
  private state: SignalRConnectionState = SignalRConnectionState.Disconnected

  /**
   * 构造函数
   * @param config SignalR配置
   * @param wxHttpService 微信HTTP服务实例
   * @param chatInfo 聊天账号信息
   */
  constructor(
    config: SignalRConfig,
    wxHttpService: WxHttpService,
    chatInfo: t_chat_push_list
  ) {
    this.config = {
      reconnectDelays: [0, 2000, 5000, 10000],
      logLevel: LogLevel.Information,
      ...config,
    }
    this.wxHttpService = wxHttpService
    this.chatInfo = chatInfo
  }

  /**
   * 建立SignalR连接
   */
  async connect(): Promise<boolean> {
    try {
      if (this.connection && this.connection.state === HubConnectionState.Connected) {
        console.log('SignalR已连接')
        return true
      }

      // 构建连接
      const hubUrl = `${this.config.serverUrl}/hubs/chatclient`
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect(this.config.reconnectDelays)
        .configureLogging(this.config.logLevel!)
        .build()

      // 注册事件处理
      this.registerHandlers()
      this.registerConnectionEvents()

      // 启动连接
      this.state = SignalRConnectionState.Connecting
      await this.connection.start()
      console.log('SignalR连接已建立')

      // 身份认证
      const success = await this.authenticate()
      if (success) {
        this.state = SignalRConnectionState.Connected
        return true
      } else {
        this.state = SignalRConnectionState.Failed
        throw new Error('身份验证失败')
      }
    } catch (error) {
      console.error('SignalR连接失败:', error)
      this.state = SignalRConnectionState.Failed
      throw error
    }
  }

  /**
   * 身份认证
   */
  private async authenticate(): Promise<boolean> {
    if (!this.connection) {
      throw new Error('连接未建立')
    }

    try {
      const chatId = this.chatInfo.id
      const key = this.chatInfo.key

      const success = await this.connection.invoke<boolean>(
        'JoinChatClient',
        chatId,
        key
      )

      if (success) {
        console.log('SignalR身份验证成功')
      } else {
        console.error('SignalR身份验证失败')
      }

      return success
    } catch (error) {
      console.error('SignalR身份验证异常:', error)
      throw error
    }
  }

  /**
   * 注册服务端调用的方法
   */
  private registerHandlers(): void {
    if (!this.connection) return

    // GetMyInfo - 获取账号信息
    this.connection.on('GetMyInfo', async (): Promise<ChatInfo> => {
      try {
        console.log('收到GetMyInfo请求')
        const myInfo = await this.wxHttpService.getMyInfo()
        return myInfo
      } catch (error) {
        console.error('GetMyInfo失败:', error)
        throw error
      }
    })

    // GetFriendList - 获取好友列表（支持分页和关键词过滤）
    this.connection.on(
      'GetFriendList',
      async (request: ChatMemberPageRequest): Promise<ChatMemberPageResult> => {
        try {
          console.log('收到GetFriendList请求', request)
          const result = await this.wxHttpService.getFriendListWithPagination(request)
          console.log(
            `返回好友列表：第${result.PageIndex}页，共${result.Total}个好友，当前页${result.Items.length}个`
          )
          return result
        } catch (error) {
          console.error('GetFriendList失败:', error)
          // 返回空结果而不是抛出异常
          return {
            Total: 0,
            PageIndex: request.PageIndex,
            PageSize: request.PageSize,
            TotalPages: 0,
            Items: [],
          }
        }
      }
    )

    // GetGroupList - 获取群列表（支持分页和关键词过滤）
    this.connection.on(
      'GetGroupList',
      async (request: ChatMemberPageRequest): Promise<ChatMemberPageResult> => {
        try {
          console.log('收到GetGroupList请求', request)
          const result = await this.wxHttpService.getGroupListWithPagination(request)
          console.log(
            `返回群列表：第${result.PageIndex}页，共${result.Total}个群，当前页${result.Items.length}个`
          )
          return result
        } catch (error) {
          console.error('GetGroupList失败:', error)
          // 返回空结果而不是抛出异常
          return {
            Total: 0,
            PageIndex: request.PageIndex,
            PageSize: request.PageSize,
            TotalPages: 0,
            Items: [],
          }
        }
      }
    )

    // GetMemberList - 获取指定成员列表
    this.connection.on(
      'GetMemberList',
      async (offIds: string[]): Promise<ChatMemberItem[]> => {
        try {
          console.log(`收到GetMemberList请求，offIds数量: ${offIds.length}`)
          const members = await this.wxHttpService.getMemberListByIds(offIds)
          return members
        } catch (error) {
          console.error('GetMemberList失败:', error)
          throw error
        }
      }
    )

    // PushChatMsg - 推送消息
    this.connection.on(
      'PushChatMsg',
      async (memberOffId: string, message: string): Promise<boolean> => {
        try {
          console.log(`收到PushChatMsg请求: ${memberOffId} - ${message}`)
          const success = await this.wxHttpService.sendMsg(memberOffId, message)
          return success
        } catch (error) {
          console.error('PushChatMsg失败:', error)
          return false
        }
      }
    )

    // ForceDisconnect - 强制断开通知
    this.connection.on('ForceDisconnect', (reason: string): void => {
      console.warn(`被服务端强制断开: ${reason}`)
      this.state = SignalRConnectionState.Disconnected
      this.disconnect()
    })
  }

  /**
   * 注册连接事件
   */
  private registerConnectionEvents(): void {
    if (!this.connection) return

    // 连接断开
    this.connection.onclose((error) => {
      console.log('SignalR连接已断开', error)
      this.state = SignalRConnectionState.Disconnected
    })

    // 开始重连
    this.connection.onreconnecting((error) => {
      console.log('SignalR开始重连', error)
      this.state = SignalRConnectionState.Reconnecting
    })

    // 重连成功
    this.connection.onreconnected(async (connectionId) => {
      console.log(`SignalR重连成功: ${connectionId}`)
      try {
        // 重新认证
        await this.authenticate()
        this.state = SignalRConnectionState.Connected
      } catch (error) {
        console.error('重连后认证失败:', error)
        this.state = SignalRConnectionState.Failed
      }
    })
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR连接已关闭')
      } catch (error) {
        console.error('关闭SignalR连接失败:', error)
      } finally {
        this.connection = null
        this.state = SignalRConnectionState.Disconnected
      }
    }
  }

  /**
   * 获取连接状态
   */
  getState(): SignalRConnectionState {
    return this.state
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return (
      this.connection !== null &&
      this.connection.state === HubConnectionState.Connected &&
      this.state === SignalRConnectionState.Connected
    )
  }

  /**
   * 获取Hub连接状态
   */
  getHubState(): HubConnectionState | null {
    return this.connection?.state || null
  }
}
