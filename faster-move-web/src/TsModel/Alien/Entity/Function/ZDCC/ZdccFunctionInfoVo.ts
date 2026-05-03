import {SiteOutOrderSet} from "@/TsModel/Alien/Entity/Function/ZDCC/SiteOutOrderSet";
import {AutoOutOrderConf} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf";
import {t_wmt_fc_zdcc_order} from "@/TsModel/Alien/Entity/Tables/function/zdcc/t_wmt_fc_zdcc_order";

/** 自动出餐信息*/
export interface ZdccFunctionInfoVo {
		/** 店铺名*/
		shop_name: string;
		/** 平台针对出外的设置 配送方案和承诺时间*/
		site_set: SiteOutOrderSet;
		/** 当前出餐设置*/
		conf: AutoOutOrderConf;
		log: Alien.Entity.GlobalModel.PageResultVo<t_wmt_fc_zdcc_order>;
		/** 等待出餐的数量*/
		count_wait_out: number;
		/** 已经出餐的数量*/
		count_has_out: number;
}
