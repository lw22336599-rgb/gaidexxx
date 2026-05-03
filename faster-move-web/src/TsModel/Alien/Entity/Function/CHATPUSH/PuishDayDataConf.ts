import {ShopDataFiledType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ShopDataFiledType";

/** 营业日报推送设置*/
import {PushDataItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushDataItem";
export interface PuishDayDataConf extends PushDataItem {
		/** 推送字段设置*/
		EnableFields: ShopDataFiledType[];
}
