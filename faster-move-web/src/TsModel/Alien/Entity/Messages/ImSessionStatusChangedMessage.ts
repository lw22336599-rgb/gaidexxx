import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";
import {ImSessionStatus} from "@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus";

/** IM会话状态变更消息
用于通知会话状态发生变化*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImSessionStatusChangedMessage extends IMessage {
		/** 消息类型*/
		Type: MessageType;
		/** 消息时间戳*/
		Timestamp: Date;
		/** 消息标题*/
		Title: string;
		/** 消息内容*/
		Content: string;
		/** 会话ID*/
		SessionId: string;
		/** 会话状态*/
		Status: ImSessionStatus;
		/** 客服最后回复时间（可空）*/
		LastAdminReplyAt?: Date | null;
		/** 完结说明（关闭时填写）*/
		CloseReason?: string | null;
}
