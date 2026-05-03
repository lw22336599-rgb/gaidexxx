import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 记录商品类目映射的属性关系*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fdmv_ctgry_prty extends BaseSys {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 商品类型 t_fdmv_ctgry.id*/
		ctgry: string;
		/** 属性  t_fdmv_prty.id*/
		property: string;
}
