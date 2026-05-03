import {AutoAdConf} from "@/TsModel/Alien/Entity/Function/ZDTG/AutoAdConf";
import {t_wmt_fc_zdtg_bidding_log} from "@/TsModel/Alien/Entity/Tables/function/zdtg/t_wmt_fc_zdtg_bidding_log";

/** 自动推广的功能信息 设置和推广日志*/
export interface ZdtgFunctionInfoVo {
		conf: AutoAdConf;
		log: Alien.Entity.GlobalModel.PageResultVo<t_wmt_fc_zdtg_bidding_log>;
}
