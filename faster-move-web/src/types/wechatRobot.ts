import type { t_chat_push_list } from '/@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'

/**
 * 微信机器人扩展类型（包含前端计算字段）
 */
export interface WechatRobotItem extends t_chat_push_list {
  /** 是否在线（基于后端 on_line 字段） */
  type: boolean
}

/**
 * 判断机器人是否在线
 * @param robot 机器人对象
 * @returns 是否在线（直接以后端返回的 on_line 字段为准）
 */
export function isRobotOnline(robot: t_chat_push_list): boolean {
  // 直接以后端返回的在线状态为准
  return robot.on_line
}

/**
 * 将后端返回的机器人列表转换为扩展类型
 * @param robots 机器人列表
 * @returns 扩展类型的机器人列表
 */
export function toWechatRobotItems(robots: t_chat_push_list[]): WechatRobotItem[] {
  return robots.map(robot => ({
    ...robot,
    type: isRobotOnline(robot)
  }))
}
