import {ChatPushConf} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatPushConf";
import {ChatItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatItem";
import {PushDataItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushDataItem";
import {PushAdNormalConf} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushAdNormalConf";
import {PuishDayDataConf} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PuishDayDataConf";

/** 配置定义*/
export interface ChatClientConfigsDef {
		/** 聊天推送配置*/
		ChatPushConf: ChatPushConf;
		/** 聊天项*/
		ChatItem: ChatItem;
		/** 推送数据项*/
		PushDataItem: PushDataItem;
		/** 推广异常推送配置*/
		PushAdNormalConf: PushAdNormalConf;
		/** 营业日报推送配置*/
		PuishDayDataConf: PuishDayDataConf;
}
