import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";
import * as Comm from '@/TsModel/Comm/Comm';

/** IM新消息VO*/
export interface ImNewMessageVO {
		/** 平台会话ID*/
		SiteSessionId: string;
		/** 平台消息唯一标识*/
		MsgUid: string;
		/** 客户ID（平台客户ID）*/
		CustomerId: string;
		/** 客户名称*/
		CustomerName: string;
		/** 消息类型*/
		MsgType: ImMsgType;
		/** 消息内容*/
		Content: string;
		/** 媒体文件URL列表
根据MsgType解释：图片消息=图片URL列表，语音消息=语音URL，视频消息=视频URL+缩略图*/
		MediaUrls?: string[] | null;
		/** 发送时间*/
		SentAt: Date;
		/** 关联的平台订单ID（可空）*/
		SiteOrderId?: string | null;
		/** 原始消息数据（JSON格式）*/
		RawData?: Comm.Dictionary<string, string> | null;
}
