import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fdmv_prty_link extends BaseSys {
		/** 平台类型1*/
		type1: ShopType;
		/** t_fdmv_prty.id*/
		type1_prty: string;
		/** 平台类型2*/
		type2: ShopType;
		/** t_fdmv_prty.id*/
		type2_prty: string;
}
