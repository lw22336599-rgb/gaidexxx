import {FoodSkuSimpleItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuSimpleItem";

/** 买赠活动*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_Gifts extends ActivityItemBase {
		/** 买什么商品*/
		BuyFood: FoodSkuSimpleItem;
		/** 送什么商品*/
		GiveFood?: FoodSkuSimpleItem | null;
		/** 如果 GiveFood 为空就是赠送其他东西就要在这填了*/
		GiveOtherName?: string | null;
		/** 赠品成本*/
		GiveOtherPrice?: number | null;
		/** 买多少*/
		BuyNum: number;
		/** 送多少*/
		GiveNum: number;
		/** 当日库存 -1 就是不限制*/
		DayStock: number;
}
