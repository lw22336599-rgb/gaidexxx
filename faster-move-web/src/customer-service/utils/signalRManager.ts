/**
 * SignalR 连接管理器
 * 用于管理客服聊天的 SignalR 连接
 */
import * as signalR from '@microsoft/signalr'
import type { HubConnection } from '@microsoft/signalr'
import type { ImMessage } from '@/TsModel/Alien/Entity/Messages/ImMessage'
import type { ImSessionAssignedMessage } from '@/TsModel/Alien/Entity/Messages/ImSessionAssignedMessage'
import type { ImSessionTransferredMessage } from '@/TsModel/Alien/Entity/Messages/ImSessionTransferredMessage'
import type { ImSessionStatusChangedMessage } from '@/TsModel/Alien/Entity/Messages/ImSessionStatusChangedMessage'
import type { ImSessionTagsUpdatedMessage } from '@/TsModel/Alien/Entity/Messages/ImSessionTagsUpdatedMessage'
import type { ImSessionRemarksUpdatedMessage } from '@/TsModel/Alien/Entity/Messages/ImSessionRemarksUpdatedMessage'
import { ImDirection } from '@/TsModel/Alien/Entity/Enums/IM/ImDirection'
import { useImSettingsStore } from '/@/store/modules/imSettings'
import { getSignalRBasePath, onApiConfigChange } from '/@/utils/apiConfig'

// 会话事件类型联合
export type SessionEvent =
  | { type: 'SessionAssigned'; data: ImSessionAssignedMessage }
  | { type: 'SessionTransferred'; data: ImSessionTransferredMessage }
  | { type: 'SessionStatusChanged'; data: ImSessionStatusChangedMessage }
  | { type: 'SessionTagsUpdated'; data: ImSessionTagsUpdatedMessage }
  | { type: 'SessionRemarksUpdated'; data: ImSessionRemarksUpdatedMessage }

// 消息接收回调类型
export type MessageReceivedCallback = (message: ImMessage) => void
export type NotificationReceivedCallback = (notification: unknown) => void
export type SessionEventCallback = (event: SessionEvent) => void
// 红点数变化回调类型
export type BadgeCountChangeCallback = () => void

class SignalRManager {
  private imConnection: HubConnection | null = null
  private notificationConnection: HubConnection | null = null
  private isConnecting = false
  private messageCallbacks: MessageReceivedCallback[] = []
  private notificationCallbacks: NotificationReceivedCallback[] = []
  private sessionEventCallbacks: SessionEventCallback[] = []
  private badgeCountChangeCallbacks: BadgeCountChangeCallback[] = []
  // 提示音 Audio 对象
  private alertAudio: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null
  private audioUnlocked = false
  private imSettingsStore: ReturnType<typeof useImSettingsStore> | null = null
  // SignalR 基础路径，会根据 API 配置动态调整
  private serverPath = getSignalRBasePath()
  private currentUserId: string | null = null
  private imRequested = false
  private notificationRequested = false

  constructor() {
    onApiConfigChange(async () => {
      await this.handleApiConfigChange()
    })

    // 尝试在首次用户交互时“解锁”音频播放权限（浏览器自动播放策略）
    this.bindUnlockAudioOnce()
  }

  private bindUnlockAudioOnce(): void {
    if (typeof window === 'undefined') {
      return
    }

    const tryUnlock = () => {
      this.unlockAudio().catch(() => {
        // 静默失败，后续仍可再次触发
      })
    }

    window.addEventListener('pointerdown', tryUnlock, { once: true, capture: true })
    window.addEventListener('keydown', tryUnlock, { once: true, capture: true })
    window.addEventListener('touchstart', tryUnlock, { once: true, capture: true })
  }

  private async unlockAudio(): Promise<void> {
    if (this.audioUnlocked) {
      return
    }
    this.audioUnlocked = true

    // 优先使用 WebAudio 解锁（更稳定）
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as
        | (new () => AudioContext)
        | undefined
      if (Ctx) {
        if (!this.audioContext) {
          this.audioContext = new Ctx()
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }
      }
    } catch {
      // 忽略
    }

    // 同时预热一次 HTMLAudioElement，减少首次播放失败概率
    try {
      if (this.alertAudio) {
        this.alertAudio.muted = true
        await this.alertAudio.play()
        this.alertAudio.pause()
        this.alertAudio.currentTime = 0
        this.alertAudio.muted = false
      }
    } catch {
      // 忽略
    }
  }

  private async playBeepFallback(): Promise<void> {
    try {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as
        | (new () => AudioContext)
        | undefined
      if (!Ctx) {
        return
      }

      if (!this.audioContext) {
        this.audioContext = new Ctx()
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const ctx = this.audioContext
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      // 简短提示音：双音阶“滴-滴”
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, now)
      oscillator.frequency.setValueAtTime(988, now + 0.09)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now)
      oscillator.stop(now + 0.18)

      oscillator.onended = () => {
        try {
          oscillator.disconnect()
        } catch {
          //
        }
        try {
          gain.disconnect()
        } catch {
          //
        }
      }
    } catch {
      // 忽略
    }
  }

  private async handleApiConfigChange(): Promise<void> {
    const newPath = getSignalRBasePath()
    if (newPath === this.serverPath) {
      return
    }

    this.serverPath = newPath

    const shouldReconnectIm = this.imRequested && !!this.currentUserId
    const shouldReconnectNotification = this.notificationRequested && !!this.currentUserId

    if (!shouldReconnectIm && !shouldReconnectNotification) {
      await this.stopConnectionsForConfigChange()
      return
    }

    await this.stopConnectionsForConfigChange()

    if (!this.currentUserId) {
      return
    }

    if (shouldReconnectIm) {
      await this.connect(this.currentUserId)
    }

    if (shouldReconnectNotification) {
      await this.connectNotification(this.currentUserId)
    }
  }

  private async stopConnectionsForConfigChange(): Promise<void> {
    if (this.imConnection) {
      try {
        await this.imConnection.stop()
      } catch {
        // 忽略断开异常
      }
      this.imConnection = null
    }

    if (this.notificationConnection) {
      try {
        await this.notificationConnection.stop()
      } catch {
        // 忽略断开异常
      }
      this.notificationConnection = null
    }

    this.isConnecting = false
  }

  private getNormalizedServerPath(): string {
    const base = (this.serverPath || '').trim()
    if (!base) {
      return ''
    }

    let normalized = base.endsWith('/') ? base.slice(0, -1) : base
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return normalized
    }

    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`
    }

    return normalized
  }

  private buildHubUrl(hubName: string): string {
    const base = this.getNormalizedServerPath()
    if (!base) {
      return `/hubs/${hubName}`
    }
    return `${base}/hubs/${hubName}`
  }

  /**
   * 连接到 SignalR IM Hub
   * @param userId 用户ID
   */
  async connect(userId: string): Promise<boolean> {
    if (this.isConnecting || this.imConnection?.state === signalR.HubConnectionState.Connected) {
      return true
    }
    if (!userId) {
      return false
    }
    this.imRequested = true

    this.isConnecting = true

    try {
      // 创建 IM Hub 连接
      this.imConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.buildHubUrl('im'))
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      // 监听接收消息事件
      this.imConnection.on('ReceiveMessage', (message: ImMessage) => {
        // 触发所有回调
        this.messageCallbacks.forEach(callback => {
          try {
            callback(message)

          } catch (error) {
            // 忽略回调错误
          }
        })
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[SignalR] ReceiveMessage', message)
        }
        if (message?.Direction === ImDirection.Incoming) {
          this.playAlertSound()
          this.triggerBadgeCountChange()
        }
      })

      // 监听会话分配事件
      this.imConnection.on('SessionAssigned', (event: ImSessionAssignedMessage) => {
        this.sessionEventCallbacks.forEach(callback => {
          try {
            callback({ type: 'SessionAssigned', data: event })
          } catch (error) {
            // 忽略回调错误
          }
        })
      })

      // 监听会话转交事件
      this.imConnection.on('SessionTransferred', (event: ImSessionTransferredMessage) => {
        this.sessionEventCallbacks.forEach(callback => {
          try {
            callback({ type: 'SessionTransferred', data: event })
          } catch (error) {
            // 忽略回调错误
          }
        })
        // 触发红点数+1
        this.playAlertSound()
        this.triggerBadgeCountChange()
      })

      // 监听会话状态变更事件
      this.imConnection.on('SessionStatusChanged', (event: ImSessionStatusChangedMessage) => {
        this.sessionEventCallbacks.forEach(callback => {
          try {
            callback({ type: 'SessionStatusChanged', data: event })
          } catch (error) {
            // 忽略回调错误
          }
        })
      })

      // 监听会话标签更新事件
      this.imConnection.on('SessionTagsUpdated', (event: ImSessionTagsUpdatedMessage) => {
        this.sessionEventCallbacks.forEach(callback => {
          try {
            callback({ type: 'SessionTagsUpdated', data: event })
          } catch (error) {
            // 忽略回调错误
          }
        })
      })

      // 监听会话备注更新事件
      this.imConnection.on('SessionRemarksUpdated', (event: ImSessionRemarksUpdatedMessage) => {
        this.sessionEventCallbacks.forEach(callback => {
          try {
            callback({ type: 'SessionRemarksUpdated', data: event })
          } catch (error) {
            // 忽略回调错误
          }
        })
      })


      // 监听重连事件
      this.imConnection.onreconnected(async () => {
        try {
          // 重连后需要重新加入管理员组
          await this.imConnection!.invoke('JoinAdmin', userId)
        } catch (error) {
          // 忽略重连错误
        }
      })

      // 监听断开连接事件
      this.imConnection.onclose(() => {
        // 连接断开
      })

      // 启动连接
      await this.imConnection.start()

      // 连接成功后，调用 JoinAdmin 加入管理员组
      await this.imConnection.invoke('JoinAdmin', userId)
      this.currentUserId = userId

      // JoinUser

      return true
    } catch (error) {
      return false
    } finally {
      this.isConnecting = false
    }
  }

  /**
   * 连接到 SignalR 通知 Hub
   * @param userId 用户ID
   */
  async connectNotification(userId: string): Promise<boolean> {
    if (this.notificationConnection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }
    if (!userId) {
      return false;
    }
    this.notificationRequested = true

    try {
      this.notificationConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.buildHubUrl('notification'))
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // 监听系统通知
      this.notificationConnection.on('ReceiveNotification', (notification: any) => {
        this.notificationCallbacks.forEach(callback => {
          try {
            callback({ type: 'notification', data: notification });
          } catch (error) {
          }
        });
      });

      // 监听广播消息
      this.notificationConnection.on('ReceiveMessage', (message: any) => {
        this.notificationCallbacks.forEach(callback => {
          try {
            callback({ type: 'broadcast', data: message });
          } catch (error) {
          }
        });
      });

      this.notificationConnection.onreconnected(async () => {
        try {
          // 重连后需要重新加入用户组
          await this.notificationConnection!.invoke('JoinUser', userId)
        } catch (error) {
        }
      });

      this.notificationConnection.onclose(() => {
      });

      await this.notificationConnection.start();

      // 连接成功后，调用 JoinUser 加入用户组
      await this.notificationConnection.invoke('JoinUser', userId);
      this.currentUserId = userId

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 断开 SignalR 连接
   */
  async disconnect(): Promise<void> {
    // 断开 IM 连接
    if (this.imConnection) {
      try {
        await this.imConnection.stop()
      } catch (error) {
      }
      this.imConnection = null
    }
    this.messageCallbacks = []
    this.sessionEventCallbacks = []

    // 断开通知连接
    if (this.notificationConnection) {
      try {
        await this.notificationConnection.stop()
      } catch (error) {
      }
      this.notificationConnection = null
    }
    this.notificationCallbacks = []
    this.imSettingsStore = null
    this.currentUserId = null
    this.imRequested = false
    this.notificationRequested = false
  }

  /**
   * 加入会话组
   * @param conversationId 会话ID
   */
  async joinConversation(conversationId: string): Promise<boolean> {
    if (!this.imConnection || this.imConnection.state !== signalR.HubConnectionState.Connected) {
      return false
    }

    try {
      await this.imConnection.invoke('JoinConversation', conversationId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 离开会话组
   * @param conversationId 会话ID
   */
  async leaveConversation(conversationId: string): Promise<boolean> {
    if (!this.imConnection || this.imConnection.state !== signalR.HubConnectionState.Connected) {
      return false
    }

    try {
      await this.imConnection.invoke('LeaveConversation', conversationId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 发送消息
   * @param message 消息内容
   */
  async sendMessage(message: any): Promise<boolean> {
    if (!this.imConnection || this.imConnection.state !== signalR.HubConnectionState.Connected) {
      return false
    }

    try {
      await this.imConnection.invoke('SendMessage', message)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 注册消息接收回调
   * @param callback 回调函数
   */
  onMessageReceived(callback: MessageReceivedCallback): void {
    this.messageCallbacks.push(callback)
  }

  /**
   * 移除消息接收回调
   * @param callback 回调函数
   */
  offMessageReceived(callback: MessageReceivedCallback): void {
    const index = this.messageCallbacks.indexOf(callback)
    if (index > -1) {
      this.messageCallbacks.splice(index, 1)
    }
  }

  /**
   * 注册会话事件回调
   * @param callback 回调函数
   */
  onSessionEvent(callback: SessionEventCallback): void {
    this.sessionEventCallbacks.push(callback)
  }

  /**
   * 移除会话事件回调
   * @param callback 回调函数
   */
  offSessionEvent(callback: SessionEventCallback): void {
    const index = this.sessionEventCallbacks.indexOf(callback)
    if (index > -1) {
      this.sessionEventCallbacks.splice(index, 1)
    }
  }

  /**
   * 注册通知接收回调
   * @param callback 回调函数
   */
  onNotificationReceived(callback: NotificationReceivedCallback): void {
    this.notificationCallbacks.push(callback)
  }

  /**
   * 移除通知接收回调
   * @param callback 回调函数
   */
  offNotificationReceived(callback: NotificationReceivedCallback): void {
    const index = this.notificationCallbacks.indexOf(callback)
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1)
    }
  }

  /**
   * 注册红点数变化回调
   * @param callback 回调函数
   */
  onBadgeCountChange(callback: BadgeCountChangeCallback): void {
    this.badgeCountChangeCallbacks.push(callback)
  }

  /**
   * 移除红点数变化回调
   * @param callback 回调函数
   */
  offBadgeCountChange(callback: BadgeCountChangeCallback): void {
    const index = this.badgeCountChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.badgeCountChangeCallbacks.splice(index, 1)
    }
  }

  /**
   * 触发红点数变化
   */
  private triggerBadgeCountChange(): void {
    // 触发所有回调
    this.badgeCountChangeCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        // 忽略回调错误
      }
    })
  }

  /**
   * 播放提示音
   */
  private playAlertSound(): void {
    const imSettingsStore = this.getImSettingsStore()
    if (!imSettingsStore?.alertSoundEnabled) {
      return
    }

    try {
      // 客服消息提示音：不能使用以 / 开头的绝对路径，
      // 否则 Electron(file://) 打包后会指向磁盘根目录而不是应用资源目录。
      const alertSoundUrl = new URL('kefu_msg.mp3', window.location.href).toString()
      // 如果 Audio 对象不存在，创建它
      if (!this.alertAudio) {
        this.alertAudio = new Audio(alertSoundUrl)
        // 设置音量（0-1之间）
        this.alertAudio.volume = 0.5
        // 预加载音频
        this.alertAudio.preload = 'auto'
      }

      // 重置播放位置到开始
      this.alertAudio.currentTime = 0

      // 播放音频：失败时用 WebAudio 生成提示音兜底（本项目默认 mp3 可能不存在）
      this.alertAudio.play().catch(() => {
        this.playBeepFallback().catch(() => {
          // 忽略播放错误（可能是浏览器限制或环境不支持）
        })
      })
    } catch (error) {
      // 忽略创建或播放音频的错误，尝试兜底提示音
      this.playBeepFallback().catch(() => {
        //
      })
    }
  }

  previewAlertSound(): void {
    this.playAlertSound()
  }

  stopAlertSound(): void {
    if (!this.alertAudio) {
      return
    }

    try {
      this.alertAudio.pause()
      this.alertAudio.currentTime = 0
    } catch (error) {
      // 忽略暂停错误
    }
  }

  private getImSettingsStore(): ReturnType<typeof useImSettingsStore> | null {
    if (this.imSettingsStore) {
      return this.imSettingsStore
    }

    try {
      this.imSettingsStore = useImSettingsStore()
      return this.imSettingsStore
    } catch (error) {
      this.imSettingsStore = null
      return null
    }
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.imConnection?.state === signalR.HubConnectionState.Connected
  }

  /**
   * 获取通知连接状态
   */
  get isNotificationConnected(): boolean {
    return this.notificationConnection?.state === signalR.HubConnectionState.Connected
  }

  /**
   * 获取连接对象
   */
  get connection(): HubConnection | null {
    return this.imConnection
  }

  /**
   * 获取通知连接对象
   */
  get notificationHubConnection(): HubConnection | null {
    return this.notificationConnection
  }
}

// 导出单例
export const signalRManager = new SignalRManager()
