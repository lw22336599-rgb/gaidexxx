import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";

export interface GetFunctionPrices_result_itemV2 {
		/** 价格id*/
		price_id: string;
		/** 价格描述*/
		price_notes: string;
		/** 功能名称*/
		func_name: string;
		/** 添加了多少天*/
		add_time: number;
		/** 售价*/
		cost: number;
		/** 邦定的功能列表*/
		functions: t_wmt_function[];
}
