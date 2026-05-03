/** 从平台摘取商品. 支持配置*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface PullShopFoodsV2Parms extends FoodManageParmsBase {
		/** 是否删除所有商品后重新拉取*/
		IsDeleteAllFoods: boolean;
}
