import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";

/** 回复消息请求*/
export interface ReplyMessageRequest {
		/** 消息类型*/
		MsgType: ImMsgType;
		/** 消息内容*/
		Content: string;
		/** 媒体文件URL列表（可选）
根据MsgType解释：图片消息=图片URL列表，语音消息=语音URL，视频消息=视频URL+缩略图*/
		MediaUrls?: string[] | null;
}
