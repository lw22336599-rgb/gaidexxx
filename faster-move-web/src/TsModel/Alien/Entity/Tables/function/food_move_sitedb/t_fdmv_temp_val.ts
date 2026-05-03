/** 针对平台的临时变量数据库*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_fdmv_temp_val extends BaseSysExTime {
		/** 变量名*/
		key: string;
		/** 变量值*/
		val: string;
}
