import {t_wmt_shop_extra} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_extra";

/** 运营版结果*/
import {t_wmt_shop_list} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
export interface ShopList_ResulItem_Extra extends t_wmt_shop_list {
		/** 运营数据都在这*/
		extra_data: t_wmt_shop_extra;
		is_top: boolean;
}
