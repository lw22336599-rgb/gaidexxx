/** 针对用户的功能,非针对店铺*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_function_admin extends BaseSys {
		enable: boolean;
		/** 用户*/
		admin: string;
		/** 功能 t_wmt_function.id*/
		function: string;
		/** 功能代码*/
		function_code: string;
		/** 功能到期时间*/
		end_time: Date;
		/** 针对此功能的conf配置*/
		conf_json?: string | null;
}
