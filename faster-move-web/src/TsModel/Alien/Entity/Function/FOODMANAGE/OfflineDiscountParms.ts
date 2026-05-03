import {UpdateSpuInSkuItem} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateSpuInSkuItem";

/** 从平台下线折扣活动, 参数SyncSite 将无效,将马上去平台执行*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface OfflineDiscountParms extends FoodManageParmsBase {
		/** 要更新的 商品和sku 如果Targets 为空则更新全部商品*/
		Targets?: UpdateSpuInSkuItem[] | null;
}
