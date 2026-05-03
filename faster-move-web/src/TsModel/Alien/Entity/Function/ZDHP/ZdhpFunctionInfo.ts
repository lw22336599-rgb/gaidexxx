import {AutoEvaluationConf} from "@/TsModel/Alien/Entity/Function/ZDHP/AutoEvaluationConf";
import {t_wmt_fc_zdhp_log} from "@/TsModel/Alien/Entity/Tables/function/zdhp/t_wmt_fc_zdhp_log";

/** 自动回评的功能信息(配置,回评日志等)*/
export interface ZdhpFunctionInfo {
		/** 功能配置*/
		conf: AutoEvaluationConf;
		/** 自动回评日志*/
		log: Alien.Entity.GlobalModel.PageResultVo<t_wmt_fc_zdhp_log>;
}
