import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

export interface ShopCount_item {
		/** 店铺类型名称*/
		Title: string;
		/** 店铺类型*/
		ShopType: ShopType;
		/** 店铺数量*/
		ShopCount: number;
}
