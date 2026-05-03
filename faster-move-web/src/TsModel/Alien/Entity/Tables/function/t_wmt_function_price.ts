import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_function_price extends BaseSys {
		title: string;
		shop_type: ShopType;
		sale_price: number;
		add_time: number;
		/** 如果支持的功能为空则表示支持所有功能*/
		multi_func: string[];
}
