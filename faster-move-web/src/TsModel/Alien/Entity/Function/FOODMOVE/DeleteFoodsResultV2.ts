import {FailedFoodItemV2} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FailedFoodItemV2";

export interface DeleteFoodsResultV2 {
		/** 删除失败的商品*/
		FailedFoods: FailedFoodItemV2[];
		/** 删除失败的分组*/
		FailedGroupOffids: string[];
}
