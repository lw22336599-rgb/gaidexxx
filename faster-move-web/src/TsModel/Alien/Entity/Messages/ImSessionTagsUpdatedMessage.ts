import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";

/** IM会话标签更新消息
用于通知会话标签发生变化*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImSessionTagsUpdatedMessage extends IMessage {
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
		/** 标签列表*/
		Tags: string[];
}
