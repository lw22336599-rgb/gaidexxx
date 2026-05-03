import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";

/** IM会话转交消息
用于通知客服会话转入或转出*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImSessionTransferredMessage extends IMessage {
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
		/** 转出客服ID（可空，首次分配时为空）*/
		FromAdminId?: string | null;
		/** 转出客服名称*/
		FromAdminName?: string | null;
		/** 转入客服ID*/
		ToAdminId: string;
		/** 转入客服名称*/
		ToAdminName: string;
		/** 转交原因*/
		TransferReason: string;
		/** 转交备注*/
		TransferRemark?: string | null;
		/** 转交时间*/
		TransferredAt: Date;
		/** 是否转入（true=转入，false=转出）*/
		IsTransferIn: boolean;
}
