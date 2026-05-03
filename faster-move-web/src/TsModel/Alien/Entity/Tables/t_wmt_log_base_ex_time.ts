/** 支持支持过期时间*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {TLogBase} from "@/TsModel/Alien/Entity/Interfaces/TLogBase";
export interface t_wmt_log_base_ex_time extends BaseSysExTime, TLogBase {
		user_id: string;
		user_name: string;
		operate_time: Date;
		operate_content: string;
}
