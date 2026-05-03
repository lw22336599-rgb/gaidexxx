import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_function_shop extends BaseSys {
		shop: string;
		shop_type: ShopType;
		shop_offid: string;
		enable: boolean;
		function: string;
		function_code: string;
		end_time: Date;
		/** 针对此功能的conf配置*/
		conf_json?: string | null;
		/** 客户端执行功能时. 最后一次记录的异常信息*/
		LastExceptionStr?: string | null;
}
