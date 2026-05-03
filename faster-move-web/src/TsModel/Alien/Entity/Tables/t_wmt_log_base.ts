/** 日志表父类*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
import {TLogBase} from "@/TsModel/Alien/Entity/Interfaces/TLogBase";
export interface t_wmt_log_base extends BaseSys, TLogBase {
		user_id: string;
		user_name: string;
		operate_time: Date;
		operate_content: string;
}
