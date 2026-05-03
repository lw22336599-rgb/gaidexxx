import {FoodItemVo} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodItemVo";
export interface AddFoodToTaskParms extends FoodItemVo {
		/** 任务*/
		task: string;
}
