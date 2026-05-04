import type { MessageTypes } from '@/TsModel/Alien/Entity/Enums/MessageTypes'
import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { ShopStatusChangeVO } from '@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopStatusChangeVO'

/** 店铺状态变更消息，平台推送店铺状态变更时触发*/
import type { IMessagePackage } from '@/TsModel/Alien/Entity/Interfaces/IMessagePackage'
export interface OnShopStatusChange extends IMessagePackage {
  MessageType: MessageTypes
  ReceiveTime: Date
  ShopType: ShopType
  ShopOffid: string
  /** 店铺状态变更信息*/
  StatusChange: ShopStatusChangeVO
}
