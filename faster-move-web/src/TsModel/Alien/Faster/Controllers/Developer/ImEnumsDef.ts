import {ImDirection} from "@/TsModel/Alien/Entity/Enums/IM/ImDirection";
import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";
import {ImSessionStatus} from "@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus";
import {ImTriggerType} from "@/TsModel/Alien/Entity/Enums/IM/ImTriggerType";
import {ImTransferReason} from "@/TsModel/Alien/Entity/Enums/IM/ImTransferReason";
import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** IM 枚举定义*/
export interface ImEnumsDef {
		/** IM 消息方向枚举*/
		ImDirection: ImDirection;
		/** IM 消息类型枚举*/
		ImMsgType: ImMsgType;
		/** IM 会话状态枚举*/
		ImSessionStatus: ImSessionStatus;
		/** IM 触发类型枚举*/
		ImTriggerType: ImTriggerType;
		/** IM 转交原因枚举*/
		ImTransferReason: ImTransferReason;
		/** SignalR 消息类型枚举*/
		MessageType: MessageType;
		/** 店铺类型枚举*/
		ShopType: ShopType;
}
