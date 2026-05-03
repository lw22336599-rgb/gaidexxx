import {EvaluationAppealConf} from "@/TsModel/Alien/Entity/Function/PJSS/EvaluationAppealConf";
import {t_wmt_fc_pjss_log} from "@/TsModel/Alien/Entity/Tables/function/pjss/t_wmt_fc_pjss_log";

/** 评价申诉的功能信息(配置,申诉日志等)*/
export interface PjssFunctionInfo {
		/** 功能配置*/
		conf: EvaluationAppealConf;
		/** 申诉日志*/
		log: Alien.Entity.GlobalModel.PageResultVo<t_wmt_fc_pjss_log>;
}
