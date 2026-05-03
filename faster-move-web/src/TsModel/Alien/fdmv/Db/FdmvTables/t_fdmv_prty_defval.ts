import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fdmv_prty_defval extends BaseSys {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 商品类型 t_fdmv_ctgry.id*/
		ctgry: string;
		/** 属性  t_fdmv_prty.id*/
		property: string;
		/** 将属性设置成默认值*/
		def_val?: boolean | null;
}
