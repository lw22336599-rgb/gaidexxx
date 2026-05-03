import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 存放每个类目下的所有属性id,不分行储存了,为了减少行扫描*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_fdmv_ctgry_allprty extends BaseSys {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 商品类型 t_fdmv_ctgry.id*/
		ctgry: string;
		/** 属性  t_fdmv_prty.id 的合集*/
		all_propertys: string[];
}
