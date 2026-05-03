import {UpdateSpuInSkuItem} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateSpuInSkuItem";
import {AdjustType} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/AdjustType";

import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodStockParms extends FoodManageParmsBase {
		/** 要更新的商品和sku列表，如果为空则更新全部商品*/
		Targets?: UpdateSpuInSkuItem[] | null;
		AdjustType: AdjustType;
		AdjustStock: number;
}
