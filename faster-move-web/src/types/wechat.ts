/**
 * 微信机器人客户端专用类型定义
 * 注意：与后端交互的类型（如ChatInfo、ChatMemberItem等）已存在于TsModel中，不要在此重复定义
 */

/**
 * 下载进度信息
 */
export interface DownloadProgress {
  /** 进度百分比 0-100 */
  percentage: number
  /** 已下载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 下载速度（字节/秒） */
  speed?: number
  /** 预计剩余时间（秒） */
  remaining?: number
}

/**
 * 下载进度回调函数类型
 */
export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * SignalR连接状态
 */
export enum SignalRConnectionState {
  /** 未连接 */
  Disconnected = 0,
  /** 连接中 */
  Connecting = 1,
  /** 已连接 */
  Connected = 2,
  /** 重连中 */
  Reconnecting = 3,
  /** 连接失败 */
  Failed = 4
}

/**
 * 微信进程状态
 */
export enum WxProcessState {
  /** 未启动 */
  NotStarted = 0,
  /** 启动中 */
  Starting = 1,
  /** 运行中 */
  Running = 2,
  /** 等待扫码 */
  WaitingForScan = 3,
  /** 已登录 */
  LoggedIn = 4,
  /** 已停止 */
  Stopped = 5,
  /** 错误 */
  Error = 6
}

/**
 * 连接步骤
 */
export enum ConnectStep {
  /** 准备工作包 */
  PreparePackage = 0,
  /** 下载工作包 */
  DownloadPackage = 1,
  /** 解压工作包 */
  ExtractPackage = 2,
  /** 启动微信客户端 */
  StartWechat = 3,
  /** 等待扫码登录 */
  WaitingScan = 4,
  /** 同步账号信息 */
  SyncAccountInfo = 5,
  /** 建立SignalR连接 */
  ConnectSignalR = 6,
  /** 同步联系人数据 */
  SyncContacts = 7,
  /** 连接完成 */
  Completed = 8
}

/**
 * 连接进度信息
 */
export interface ConnectProgress {
  /** 当前步骤 */
  step: ConnectStep
  /** 步骤描述 */
  message: string
  /** 是否可以取消 */
  canCancel: boolean
  /** 下载进度（仅在下载步骤有效） */
  downloadProgress?: DownloadProgress
  /** 错误信息 */
  error?: string
}

/**
 * 工作包配置
 */
export interface WorkPackageConfig {
  /** 下载URL */
  downloadUrl: string
  /** 临时目录路径 */
  tempDir: string
  /** 可执行文件名 */
  executableName: string
}

/**
 * 微信HTTP服务配置
 */
export interface WxHttpServiceConfig {
  /** 微信HTTP服务地址 */
  host: string
  /** 端口 */
  port: number
  /** 超时时间（毫秒） */
  timeout: number
}

/**
 * SignalR配置
 */
export interface SignalRConfig {
  /** 服务器地址 */
  serverUrl: string
  /** Hub路径 */
  hubPath: string
  /** 自动重连 */
  automaticReconnect: boolean
  /** 超时时间（毫秒） */
  timeout: number
}
