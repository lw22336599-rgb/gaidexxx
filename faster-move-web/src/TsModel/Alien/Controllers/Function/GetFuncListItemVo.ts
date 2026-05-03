import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";
export interface GetFuncListItemVo extends t_wmt_function {
		/** 本月已售积分*/
		sold_month: number;
		/** 累计已售积分*/
		sold_total: number;
		/** 今日售卖*/
		sold_today: number;
}
