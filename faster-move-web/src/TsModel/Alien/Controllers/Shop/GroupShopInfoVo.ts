import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 分组店铺信息*/
export interface GroupShopInfoVo {
		/** 店铺id*/
		id: string;
		/** 店铺名*/
		name: string;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 门店id*/
		office_id: string;
		/** 城市*/
		city: string;
		/** 分组名*/
		group_name: string;
		/** 备注*/
		notes: string;
}
