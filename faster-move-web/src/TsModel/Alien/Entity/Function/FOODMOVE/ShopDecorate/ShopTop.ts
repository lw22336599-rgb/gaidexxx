import {FoodImage} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodImage";

/** 店铺招牌*/
export interface ShopTop {
		/** 店铺招牌图片*/
		ImgUrl: FoodImage;
		/** 店铺招牌图片2 这是饿了么会有*/
		ImgUrl2?: FoodImage | null;
		/** 关联商品*/
		LinkFoodSpus?: string[] | null;
}
