/** 删除商品的参数 将强制从平台删除,SyncSite 参数将无效*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface DeleteFoodsParms extends FoodManageParmsBase {
		Page?: number | null;
		FoodIds: string[];
}
