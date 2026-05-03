/** 添加商品分组到任务*/
import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";
export interface AddGroupToTaskParms extends FoodGroupItem {
		task: string;
}
