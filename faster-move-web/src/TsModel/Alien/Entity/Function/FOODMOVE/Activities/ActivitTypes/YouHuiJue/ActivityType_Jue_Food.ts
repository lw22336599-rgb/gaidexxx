import {FoodSkuSimpleItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuSimpleItem";

export interface ActivityType_Jue_Food {
		/** 关联商品*/
		FoodSku: FoodSkuSimpleItem;
		/** 特价多少 要比原来的商品少*/
		SalePrice: number;
}
