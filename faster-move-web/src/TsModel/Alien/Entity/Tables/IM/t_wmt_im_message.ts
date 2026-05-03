import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ImDirection} from "@/TsModel/Alien/Entity/Enums/IM/ImDirection";
import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";
import {ImTriggerType} from "@/TsModel/Alien/Entity/Enums/IM/ImTriggerType";
import * as Comm from '@/TsModel/Comm/Comm';

/** IM消息表
存储具体的聊天消息内容*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_im_message extends BaseSysExTime {
		/** 会话ID（关联 t_wmt_im_session.id）*/
		session_id: string;
		/** 店铺ID（t_wmt_shop_list.id，冗余字段）*/
		shop_id: string;
		/** 平台类型*/
		site_type: ShopType;
		/** 消息唯一标识（平台消息ID）
用于消息幂等性保证*/
		msg_uid?: string | null;
		/** 消息方向（Incoming=客户→商家，Outgoing=商家→客户）*/
		direction: ImDirection;
		/** 消息类型（文本、图片、语音等）*/
		msg_type: ImMsgType;
		/** 消息触发类型（客户主动/客服主动/系统自动）*/
		trigger_type: ImTriggerType;
		/** 消息内容
在PostgreSQL中会映射为text类型*/
		content: string;
		/** 媒体文件URL列表（JSON格式存储）
根据msg_type解释：图片消息=图片URL列表，语音消息=语音URL，视频消息=视频URL+缩略图
在PostgreSQL中会映射为jsonb类型*/
		media_urls?: string[] | null;
		/** 发送时间
在PostgreSQL中会映射为timestamp without time zone类型*/
		sent_at: Date;
		/** 是否已读*/
		is_read: boolean;
		/** 需要储存的平台扩展信息
在PostgreSQL中会映射为jsonb类型*/
		site_data?: Comm.Dictionary<string, string> | null;
}
