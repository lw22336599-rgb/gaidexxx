/** 功能项保存参数*/
import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";
export interface FunctionSaveVo extends t_wmt_function {
		/** 售卖积分(月)*/
		price_month: number;
		/** 售卖积分(季)*/
		price_season: number;
		/** 售卖积分(半年)*/
		price_halfyear: number;
		/** 售卖积分(年)*/
		price_year: number;
}
