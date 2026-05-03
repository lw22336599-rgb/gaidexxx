import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 店铺信息*/
export interface ShopInfoVo {
		/** 店铺ID*/
		ShopId: string;
		/** 店铺OfficeId*/
		OfficeId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 店铺头像*/
		ShopImg?: string | null;
		/** 店铺类型*/
		ShopType: ShopType;
}
