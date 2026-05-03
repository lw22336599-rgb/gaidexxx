import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodImageBorderParms extends FoodManageParmsBase {
		/** 商品ID列表，为空则处理所有商品*/
		FoodIds?: string[] | null;
		/** 图片边框链接*/
		BorderImageUrl: string;
		/** 是否只设置主图（第一张图片）
true: 只设置主图
false: 设置所有图片*/
		OnlyMainImage: boolean;
}
