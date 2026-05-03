/** 远程浏览器 Tab 页描述 */
export interface RemoteBrowserPageDescriptor {
  PageKey: string
  DisplayName: string
  InitialUrl: string
  SortOrder: number
}

/** 服务端推送到前端的业务通知 */
export interface RemoteBrowserNotificationDto {
  Message: string
  Severity?: string
  PlaySound: boolean
  SoundId?: string
  PageKey?: string
}

/** 踢线或会话结束前通知 */
export interface RemoteBrowserClosingDto {
  ShopId: string
  Reason: RemoteBrowserClosingReason
  Message?: string
}

export enum RemoteBrowserClosingReason {
  ReplacedByNewConnection = 1,
  ServerShutdown = 2,
}

/** Hub 下发的统一指令信封 */
export interface RemoteBrowserCommandEnvelope {
  CommandType: string
  CorrelationId: string
  PageKey?: string
  PayloadJson?: string
}

/** 远程浏览器要展示的店铺项（老到新复制、竞对等场景由平台实现返回） */
export interface RemoteBrowserShopItem {
  Id: string
  Name: string
  ShopType: number
  OfficeId?: string
}

export enum CreateTaskTypeEnum {
  None = 0,
  老到新复制 = 1,
  竞对复制 = 2,
  商品批量管理 = 3,
}
