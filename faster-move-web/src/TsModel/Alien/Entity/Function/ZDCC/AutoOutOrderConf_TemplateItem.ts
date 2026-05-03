import {AutoOutOrderConf_Time} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf_Time";

export interface AutoOutOrderConf_TemplateItem {
		/** 模板名称*/
		Name: string;
		/** 模板正常出餐时间*/
		DefaultConf: AutoOutOrderConf_Time;
		/** 不同时间段 具体时间及出餐设置 只有以上配置不符合条件时才会走到这*/
		Conf_Time: AutoOutOrderConf_Time[];
}
