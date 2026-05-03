import {PushDataItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/PushDataItem";
export interface PushAdNormalConf extends PushDataItem {
		/** 小于这个值时将视为推广异常*/
		MinAdBalance?: number | null;
}
