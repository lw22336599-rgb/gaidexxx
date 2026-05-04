import type { MessageTypes } from '@/TsModel/Alien/Entity/Enums/MessageTypes'
import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'

import type { IMessagePackage } from '@/TsModel/Alien/Entity/Interfaces/IMessagePackage'
export interface MessagePackage extends IMessagePackage {
  MessageType: MessageTypes
  ShopType: ShopType
  ShopOffid: string
}
