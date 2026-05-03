import {FailedFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FailedFoodItem";

/** 删除商商品失败的*/
export interface DeleteFoodsResult {
		/** 删除失败的商品*/
		FailedFoods: FailedFoodItem[];
}
