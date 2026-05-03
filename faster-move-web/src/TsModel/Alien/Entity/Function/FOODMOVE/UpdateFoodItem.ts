import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";

/** 更新商品时需要的参数类*/
export interface UpdateFoodItem {
		OriginalFood: FoodItem;
		NewFood: FoodItem;
}
