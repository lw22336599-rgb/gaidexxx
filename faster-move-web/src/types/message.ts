/**
 * 微信消息相关类型定义
 */

/**
 * 微信消息对象
 */
export interface WxMessage {
  /** 消息来源群组ID */
  fromGroup: string
  /** 消息发送者ID */
  fromUser: string
  /** 消息内容 */
  content: string
  /** @用户列表 XML格式：<atuserlist>wxid_xxx</atuserlist> */
  atuserlist?: string
  /** 消息类型 */
  type?: number
  /** 时间戳 */
  timestamp?: number
}

/**
 * 消息命令类型
 */
export enum MessageCommandType {
  /** 设置管理员 */
  SetManager = 'set_manager',
  /** 取消管理员 */
  RemoveManager = 'remove_manager',
  /** 查看管理员列表 */
  ViewManagers = 'view_managers',
  /** 绑定门店 */
  BindShop = 'bind_shop',
  /** 未知命令 */
  Unknown = 'unknown'
}

/**
 * 消息处理结果
 */
export interface MessageHandleResult {
  /** 是否成功 */
  success: boolean
  /** 命令类型 */
  commandType: MessageCommandType
  /** 结果消息 */
  message?: string
  /** 错误信息 */
  error?: string
}

/**
 * 消息服务器配置
 */
export interface MessageServerConfig {
  /** 机器人ID */
  robotId: string
  /** 监听端口 */
  port: number
  /** 微信HTTP服务地址 */
  wxHttpHost: string
  /** 微信HTTP服务端口 */
  wxHttpPort: number
}
