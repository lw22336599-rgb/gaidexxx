import {ActivityType_CZHG_FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_CZHG_FoodItem";

/** 超值换购*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_CZHG extends ActivityItemBase {
		/** 订单实付满多少 小于1 等于是不限制*/
		FullPrice: number;
		/** 超值换购商品列表*/
		FoodItems: ActivityType_CZHG_FoodItem[];
}
