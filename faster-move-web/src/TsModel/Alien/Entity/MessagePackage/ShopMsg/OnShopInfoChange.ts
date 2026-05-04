import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import type { ShopInfoChangeVO } from '@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopInfoChangeVO'
import type { MessageTypes } from '@/TsModel/Alien/Entity/Enums/MessageTypes'

/** 店铺信息变更消息，平台推送店铺信息变更时触发*/
import type { IMessagePackage } from '@/TsModel/Alien/Entity/Interfaces/IMessagePackage'
export interface OnShopInfoChange extends IMessagePackage {
  ReceiveTime: Date
  ShopType: ShopType
  ShopOffid: string
  /** 店铺信息变更信息*/
  InfoChange: ShopInfoChangeVO
  MessageType: MessageTypes
}
