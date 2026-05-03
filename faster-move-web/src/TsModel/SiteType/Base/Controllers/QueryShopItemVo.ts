import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 店铺查询结果*/
export interface QueryShopItemVo {
		/** 店铺id*/
		id: string;
		/** 店铺名*/
		name: string;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 门店id*/
		office_id: string;
}
