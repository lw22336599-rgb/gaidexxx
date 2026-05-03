import {CombineFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineFoodItem";

/** 分组套餐内的单个商品*/
export interface CombineGroupFoodItem {
		Food: CombineFoodItem;
		/** 默认选择*/
		DefaultSelected: boolean;
		/** 需要加价*/
		AppendPrice: number;
		/** 必选*/
		RequiredSelected: boolean;
}
