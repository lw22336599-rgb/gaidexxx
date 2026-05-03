import {t_wmt_log_base} from "@/TsModel/Alien/Entity/Tables/t_wmt_log_base";
import {TLogBase} from "@/TsModel/Alien/Entity/Interfaces/TLogBase";
export interface t_wmt_log_balance extends t_wmt_log_base, TLogBase {
		/** 这里应该是被影响的管理员或代理id*/
		user: string;
		new_balance: number;
		/** 金额从哪个用户来的- 如果是扣除,就是什么余额从哪去了*/
		source_user: string;
		val: number;
		why: string;
		/** 对更新做一些简单说明*/
		msg: string;
}
