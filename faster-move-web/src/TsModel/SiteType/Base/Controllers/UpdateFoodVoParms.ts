import {FoodItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItemBase";
export interface UpdateFoodVoParms extends FoodItemBase {
		/** 任务*/
		task: string;
		/** t_wmt_fc_fdmv_food.id*/
		food_id: string;
}
