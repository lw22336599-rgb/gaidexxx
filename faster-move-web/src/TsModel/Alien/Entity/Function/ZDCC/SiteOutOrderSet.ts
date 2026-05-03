import {AutoOutOrderConf_Time} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf_Time";

/** 平台针对出餐的设置(承诺出餐和配送方案)*/
export interface SiteOutOrderSet {
		/** 承诺出餐*/
		PromiseTime: AutoOutOrderConf_Time[];
		/** 配送方案*/
		DeliveryPlan: string[];
}
