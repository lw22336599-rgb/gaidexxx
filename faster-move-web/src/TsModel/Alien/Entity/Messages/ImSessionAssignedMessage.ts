import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";

/** IM会话分配消息
用于通知客服有新会话分配*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImSessionAssignedMessage extends IMessage {
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
		/** 客户ID*/
		CustomerId: string;
		/** 客户名称*/
		CustomerName: string;
		/** 最后一条消息内容*/
		LastMessage: string;
		/** 未读消息数*/
		UnreadCount: number;
		/** 分配时间*/
		AssignedAt: Date;
		/** 分配给的客服ID*/
		AssignedAdminId: string;
		/** 分配给的客服名称*/
		AssignedAdminName: string;
}
