/** 恢复更改的商品,也就是把 商品表中的 FoodUpdate 删除了*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface RecoverFoodParms extends FoodManageParmsBase {
		/** 要恢复的商品id*/
		FoodIds: string[];
}
