import * as Comm from '@/TsModel/Comm/Comm';
import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";

/** 等待回复的消息对象
用于平台IM消息的发送和回复*/
export interface WaitReplyMsg {
		/** 是否来自自己的消息*/
		IsFromSelf: boolean;
		/** 这消息是谁发的*/
		FromUser: string;
		/** 如果不为空就代表售后,为空就是售前*/
		OrderId?: string | null;
		/** 消息内容*/
		MsgContent: string;
		/** 收到此用户消息的时间*/
		SendTime: Date;
		/** 回复消息*/
		RepStr: string;
		/** 存放其他值 发送消息时,如果是IM集中管理需要取 t_wmt_im_session 中最后一条收到消息的原始数据附值*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** 平台会话ID（可选，用于IM集中管理）*/
		SiteSessionId?: string | null;
		/** 消息唯一标识（可选，用于IM集中管理）*/
		MsgUid?: string | null;
		/** 消息类型（文本、图片、语音、视频、文件等）*/
		MsgType: ImMsgType;
		/** 媒体文件URL列表（图片、语音、视频等）
- 图片消息：存储图片URL列表
- 语音消息：存储语音文件URL
- 视频消息：存储视频URL（第一个）和缩略图URL（第二个，可选）
根据MsgType来解释List中的内容*/
		MediaUrls?: string[] | null;
}
