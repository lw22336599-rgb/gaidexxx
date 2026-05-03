import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";
import {PartDb_FoodWithTask} from "@/TsModel/Alien/Entity/Function/FOODMOVE/PartDb_FoodWithTask";

export interface AddFoodV2Parms {
		/** 新店原商品*/
		NewFood: FoodItem;
		/** 老店原商品*/
		OldFood: FoodItem;
		/** 任务信息*/
		FoodWithTask?: PartDb_FoodWithTask | null;
}
