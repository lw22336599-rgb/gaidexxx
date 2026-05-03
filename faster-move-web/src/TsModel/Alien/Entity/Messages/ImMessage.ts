import {MessageType} from "@/TsModel/Alien/Entity/Enums/MessageType";
import {ImDirection} from "@/TsModel/Alien/Entity/Enums/IM/ImDirection";
import {ImMsgType} from "@/TsModel/Alien/Entity/Enums/IM/ImMsgType";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** IM 消息
用于推送即时消息通知*/
import {IMessage} from "@/TsModel/Alien/Entity/Interfaces/IMessage";
export interface ImMessage extends IMessage {
		/** 消息类型*/
		Type: MessageType;
		/** 消息时间戳*/
		Timestamp: Date;
		/** 消息标题*/
		Title: string;
		/** 消息内容*/
		Content: string;
		/** 店铺ID（t_wmt_shop_list.id）*/
		ShopId: string;
		/** 会话ID*/
		SessionId: string;
		/** 会话唯一标识*/
		SessionUid: string;
		/** 客户ID*/
		CustomerId: string;
		/** 客户名称*/
		CustomerName: string;
		/** 客户头像URL（可选）*/
		CustomerAvatar?: string | null;
		/** 消息唯一标识*/
		MsgUid: string;
		/** 消息方向*/
		Direction: ImDirection;
		/** IM 消息类型*/
		MsgType: ImMsgType;
		/** 消息预览（截取的部分内容）*/
		MessagePreview: string;
		/** 媒体文件URL列表
根据MsgType解释：图片消息=图片URL列表，语音消息=语音URL，视频消息=视频URL+缩略图*/
		MediaUrls?: string[] | null;
		/** 未读消息数*/
		UnreadCount: number;
		/** 平台类型*/
		SiteType: ShopType;
}
