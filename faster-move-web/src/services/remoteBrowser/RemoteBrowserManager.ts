/**
 * 远程浏览器 SignalR 连接管理（每店铺一条连接）
 * 方法名即 SignalR 调用名，与 ChatClient 一致
 */
import * as signalR from '@microsoft/signalr'
import type { HubConnection } from '@microsoft/signalr'
import { getSignalRBasePath } from '/@/utils/apiConfig'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import type {
  RemoteBrowserClosingDto,
  RemoteBrowserNotificationDto
} from '/@/TsModel/Alien/Entity/WebView/RemoteBrowserDtos'
import type { RemoteBrowserPageDescriptor } from '/@/TsModel/Alien/Entity/WebView/RemoteBrowserDtos'

export type RemoteBrowserConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed'

export interface RemoteBrowserShopInfo {
  shopId: string
  shopType: number
  shopName: string
  state: RemoteBrowserConnectionState
  connection: HubConnection | null
}

type OnClosingCallback = (dto: RemoteBrowserClosingDto) => void
type OnNotifyCallback = (dto: RemoteBrowserNotificationDto) => void
type OnSyncPagesCallback = (shopId: string, pages: RemoteBrowserPageDescriptor[]) => void
type OnStateChangeCallback = (shopId: string) => void

export class RemoteBrowserManager {
  private shopConnections = new Map<string, RemoteBrowserShopInfo>()
  private onClosingCallbacks: OnClosingCallback[] = []
  private onNotifyCallbacks: OnNotifyCallback[] = []
  private onSyncPagesCallback: OnSyncPagesCallback | null = null
  private onStateChangeCallbacks: OnStateChangeCallback[] = []

  onStateChange(cb: OnStateChangeCallback): () => void {
    this.onStateChangeCallbacks.push(cb)
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb)
    }
  }

  private setShopState(shopId: string, state: RemoteBrowserConnectionState): void {
    const info = this.shopConnections.get(shopId)
    if (info) {
      info.state = state
      this.onStateChangeCallbacks.forEach(cb => cb(shopId))
    }
  }

  onClosing(cb: OnClosingCallback): () => void {
    this.onClosingCallbacks.push(cb)
    return () => {
      this.onClosingCallbacks = this.onClosingCallbacks.filter(c => c !== cb)
    }
  }

  onNotify(cb: OnNotifyCallback): () => void {
    this.onNotifyCallbacks.push(cb)
    return () => {
      this.onNotifyCallbacks = this.onNotifyCallbacks.filter(c => c !== cb)
    }
  }

  onSyncPages(cb: OnSyncPagesCallback | null): void {
    this.onSyncPagesCallback = cb
  }

  getShopInfo(shopId: string): RemoteBrowserShopInfo | undefined {
    return this.shopConnections.get(shopId)
  }

  getAllShops(): RemoteBrowserShopInfo[] {
    return Array.from(this.shopConnections.values())
  }

  async connect(shopId: string, shopType: number, shopName: string): Promise<boolean> {
    const key = shopId
    if (this.shopConnections.get(key)?.state === 'connected') {
      return true
    }

    const basePath = getSignalRBasePath()
    const hubUrl = `${basePath}/hubs/remotebrowser`
    const token = localStorage.getItem('token') || ''

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build()

    this.shopConnections.set(key, {
      shopId,
      shopType,
      shopName,
      state: 'connecting',
      connection
    })
    this.setShopState(key, 'connecting')

    connection.on('RemoteBrowserClosing', (dto: RemoteBrowserClosingDto) => {
      this.onClosingCallbacks.forEach(cb => cb(dto))
    })

    connection.on('Notify', (dto: RemoteBrowserNotificationDto) => {
      this.onNotifyCallbacks.forEach(cb => cb(dto))
    })

    connection.on('ForceDisconnect', () => {
      connection.stop()
    })

    connection.onclose(() => {
      this.setShopState(key, 'disconnected')
    })

    connection.onreconnecting(() => {
      this.setShopState(key, 'connecting')
    })

    connection.onreconnected(async () => {
      // 后端重启后重连：新 connection 有新 connectionId，需重新 JoinRemoteBrowser 更新缓存，否则后端仍用旧 connectionId 报错
      try {
        const keyResult = await apiManager.remoteBrowserApi.GetConnectionKey(shopId, shopType)
        const joined = await connection.invoke<boolean>('JoinRemoteBrowser', shopId, shopType, keyResult.Key)
        if (joined) {
          this.setShopState(key, 'connected')
        } else {
          this.setShopState(key, 'failed')
        }
      } catch (err) {
        console.error('RemoteBrowser 重连后 JoinRemoteBrowser 失败:', err)
        this.setShopState(key, 'failed')
      }
    })

    this.registerMethodHandlers(connection, shopId)

    try {
      await connection.start()
      const keyResult = await apiManager.remoteBrowserApi.GetConnectionKey(shopId, shopType)
      const joined = await connection.invoke<boolean>('JoinRemoteBrowser', shopId, shopType, keyResult.Key)
      if (!joined) {
        await connection.stop()
        this.setShopState(key, 'failed')
        return false
      }
      this.setShopState(key, 'connected')
      return true
    } catch (err) {
      console.error('RemoteBrowser 连接失败:', err)
      this.setShopState(key, 'failed')
      return false
    }
  }

  private registerMethodHandlers(connection: HubConnection, shopId: string): void {
    const electron = (window as any).electron
    const invoke = (method: string, ...args: any[]) => {
      if (!electron?.remoteBrowserInvoke) {
        throw new Error('非 Electron 环境')
      }
      return electron.remoteBrowserInvoke(shopId, method, ...args)
    }

    connection.on('Ping', async () => invoke('Ping'))
    connection.on('HttpRequest', async (request: any) => invoke('HttpRequest', request))
    connection.on('HttpRequestSharPage', async (item: any) => invoke('HttpRequestSharPage', item))
    connection.on('ExecuteScript', async (pageKey: string | null, script: string) =>
      invoke('ExecuteScript', pageKey, script)
    )
    connection.on('Navigate', async (pageKey: string | null, url: string) => invoke('Navigate', pageKey, url))
    connection.on('GetCookieString', async (pageKey: string | null) => invoke('GetCookieString', pageKey))
    connection.on('GetCookieResult', async (request: any) => invoke('GetCookieResult', request))
    connection.on('GetShopInfo', async () => invoke('GetShopInfo'))
    connection.on('GetHealthInfo', async () => invoke('GetHealthInfo'))
    connection.on('InterceptRequest', async (item: any) => invoke('InterceptRequest', item))

    connection.on('SyncPages', async (pages: RemoteBrowserPageDescriptor[]) => {
      const result = await invoke('SyncPages', pages)
      this.onSyncPagesCallback?.(shopId, pages ?? [])
      return result
    })
    connection.on('InitializeMain', async (request: any) => invoke('InitializeMain', request))
    connection.on('CloseShop', async () => invoke('CloseShop'))
  }

  async disconnect(shopId: string): Promise<void> {
    const info = this.shopConnections.get(shopId)
    if (info?.connection) {
      try {
        await info.connection.stop()
      } catch {
        // ignore
      }
      this.shopConnections.delete(shopId)
    }
  }

  async disconnectAll(): Promise<void> {
    for (const [id] of this.shopConnections) {
      await this.disconnect(id)
    }
  }
}

export const remoteBrowserManager = new RemoteBrowserManager()
