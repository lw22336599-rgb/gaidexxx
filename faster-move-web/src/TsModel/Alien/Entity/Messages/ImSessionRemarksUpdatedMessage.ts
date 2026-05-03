import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";

/** IM会话备注更新消息
用于通知会话备注发生变化*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImSessionRemarksUpdatedMessage extends IMessage {
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
		/** 备注内容*/
		Remarks: string;
}
