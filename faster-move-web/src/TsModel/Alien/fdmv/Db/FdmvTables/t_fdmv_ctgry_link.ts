import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fdmv_ctgry_link extends BaseSys {
		/** 平台类型1*/
		type1: ShopType;
		/** t_fdmv_ctgry.id*/
		type1_ctgry: string;
		/** 平台类型2*/
		type2: ShopType;
		/** t_fdmv_ctgry.id*/
		type2_ctgry: string;
		/** 相似度*/
		match_rate: number;
}
