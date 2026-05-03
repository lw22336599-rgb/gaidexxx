import {FoodContendDataState} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodContendDataState";

export interface FoodDataStateItem {
		/** 商品spu*/
		spu_id: string;
		/** 商品数据状态*/
		states: FoodContendDataState[];
}
