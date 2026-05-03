import {ProductTabType} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/ProductTabType";

import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface QueryFoodsParms extends FoodManageParmsBase {
		/** 页数*/
		Page: number;
		/** 商品ID列表 如果为空就不限制*/
		FoodIds: string[];
		/** 商品名*/
		ProductName?: string | null;
		/** 最低价*/
		MinPrice?: number | null;
		/** 最高价*/
		MaxPrice?: number | null;
		/** 是否折扣*/
		IsDiscount?: boolean | null;
		/** 是否上架*/
		IsOnSale?: boolean | null;
		/** 商品标签类型（全部商品、售卖中、已下架、活动商品、多规格商品）*/
		TabType?: ProductTabType | null;
}
