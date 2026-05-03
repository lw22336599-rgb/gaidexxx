import {FoodStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodStatusType";

import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodStateParms extends FoodManageParmsBase {
		/** 商品ID列表*/
		FoodIds?: string[] | null;
		/** 商品上下架状态*/
		IsOnSale: FoodStatusType;
}
