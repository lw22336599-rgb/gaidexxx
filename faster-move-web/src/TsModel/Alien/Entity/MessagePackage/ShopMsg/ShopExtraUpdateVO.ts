import {t_wmt_shop_extra} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_extra";

/** 店铺运营数据更新VO*/
export interface ShopExtraUpdateVO {
		/** 店铺运营数据实体*/
		ShopExtra: t_wmt_shop_extra;
		/** 更新时间*/
		UpdateTime: Date;
}
