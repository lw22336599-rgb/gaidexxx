import {ReplyRateInfoVo} from "@/TsModel/Alien/Entity/Function/IMZDHF/ReplyRateInfoVo";
import {AutomaticReplyConf} from "@/TsModel/Alien/Entity/Function/IMZDHF/AutomaticReplyConf";
import {t_wmt_fc_imzdhf_log} from "@/TsModel/Alien/Entity/Tables/function/imzdhf/t_wmt_fc_imzdhf_log";

/** 智能回复功能信息*/
export interface ImzdhfFunctionInfoVo {
		/** 回复率*/
		rate_info: ReplyRateInfoVo;
		/** 自动回复配置*/
		conf: AutomaticReplyConf;
		/** 日志*/
		log: Alien.Entity.GlobalModel.PageResultVo<t_wmt_fc_imzdhf_log>;
}
