import type { MessageTypes } from '@/TsModel/Alien/Entity/Enums/MessageTypes'
import type { AutoOutOrderMessage } from '@/TsModel/Alien/Entity/MessagePackage/AutoOutOrderMessage'

/** 自动出餐订单消息包装类
用于 RabbitMQ 消息传递*/
import type { IMessagePackage } from '@/TsModel/Alien/Entity/Interfaces/IMessagePackage'
export interface AutoOutOrderMsg extends IMessagePackage {
  MessageType: MessageTypes
  /** 消息接收时间*/
  ReceiveTime: Date
  /** 自动出餐订单消息内容*/
  OrderMessage: AutoOutOrderMessage
}
