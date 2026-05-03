import {FoodItemVo} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodItemVo";

import {FoodTaskLog} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodTaskLog";
export interface FoodTaskLogError extends FoodTaskLog {
		FoodVo: FoodItemVo;
}
