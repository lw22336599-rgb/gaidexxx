import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";

import {t_wmt_function_admin} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function_admin";
export interface AdminFunctionVo extends t_wmt_function_admin {
		/** 应用*/
		Function: t_wmt_function;
}
