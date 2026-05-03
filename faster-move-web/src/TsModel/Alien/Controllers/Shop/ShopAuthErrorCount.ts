import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 店铺授权异常统计*/
export interface ShopAuthErrorCount {
		/** 店铺类型*/
		ShopType: ShopType;
		/** 授权异常（已掉线）的店铺数量*/
		Count: number;
}
