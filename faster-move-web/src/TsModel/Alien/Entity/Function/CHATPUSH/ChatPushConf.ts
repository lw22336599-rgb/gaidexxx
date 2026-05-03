import {ChatItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatItem";
import {PushDataItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushDataItem";
import {PushAdNormalConf} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushAdNormalConf";
import {PuishDayDataConf} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PuishDayDataConf";

export interface ChatPushConf {
		/** 可以推送到多个群和微信好友，包括 webhook类型的机器人*/
		PushGroupOffIds: ChatItem[];
		/** 推送到多个好友 如果是webhook 类型就为null*/
		PushFriendOffids?: ChatItem[] | null;
		/** 闭店监控(营业时间内,非正常变更营业状态)*/
		PushNormalClose?: PushDataItem | null;
		/** 推广余额不足*/
		PushNormalAd?: PushAdNormalConf | null;
		/** 中差评推送*/
		PushBadComment?: PushDataItem | null;
		/** 店铺营业日报*/
		PushShopReport?: PuishDayDataConf | null;
		/** 店铺到期提醒推送*/
		PushShopEndTime?: PushDataItem | null;
		/** 店铺掉线提醒推送*/
		PushShopOut?: PushDataItem | null;
		/** 推送内容的前辍 (为空代表不启用)*/
		PushStrFirst?: string | null;
		/** 推送内容的后辍 (为空代表不启用)*/
		PushStrLast?: string | null;
		/** 开启用上箭头标记上升*/
		MarkTop: boolean;
		/** 开启用下箭头标记下降*/
		MarkLow: boolean;
		/** 开启命令绑定*/
		CommandBind: boolean;
}
