import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 存放用户关联的店铺（很重要）*/
import {BaseSysGroup} from "@/TsModel/Alien/Entity/Tabls/BaseSysGroup";
export interface t_wmt_shop_user extends BaseSysGroup {
		/** 铺id*/
		shop: string;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 所属管理，代理，商家*/
		admin: string;
}
