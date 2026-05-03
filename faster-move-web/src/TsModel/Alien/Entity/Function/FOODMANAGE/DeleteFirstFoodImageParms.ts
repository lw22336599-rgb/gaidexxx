/** 删除第一张主图,只有一张将跳过*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface DeleteFirstFoodImageParms extends FoodManageParmsBase {
		/** 要删除的商品id列表. 不传则删除全部商品的第一张主图*/
		FoodIds?: string[] | null;
}
