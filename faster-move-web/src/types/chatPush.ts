import type { ChatPushConf } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatPushConf'
import type { ChatMemberItem } from '/@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import type { ShopList_ResulItem_Extra } from '/@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem_Extra'

/**
 * 推送配置数据（包含店铺信息）
 */
export interface ChatPushFuncData {
  shop: string | null
  code: string
  ConfObj: ChatPushConf
  LastExceptionStr?: string | null
}

/**
 * 店铺列表项（带推送状态）
 */
export interface ShopListItemWithChatPush extends ShopList_ResulItem_Extra {
  chatendtime?: string
  chatcheck?: boolean
}

/**
 * 绑定微信的参数
 */
export interface BindWxParams {
  /** 1=好友, 2=群组 */
  type: number
  obj: ChatMemberItem
  rodiobj: {
    offid: string
    [key: string]: any
  }
}
