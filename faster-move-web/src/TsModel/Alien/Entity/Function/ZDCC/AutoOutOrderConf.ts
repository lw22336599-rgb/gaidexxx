import {AutoOutOrderConf_Time} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf_Time";
import {ReserveOrderConf} from "@/TsModel/Alien/Entity/Function/ZDCC/ReserveOrderConf";
import {AutoOutOrderConf_TemplateItem} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf_TemplateItem";
import {AutoOutOrderConf_slow} from "@/TsModel/Alien/Entity/Function/ZDCC/AutoOutOrderConf_slow";

export interface AutoOutOrderConf {
		/** 默认配置 其他配置都不符合条件时. 此配置才生效*/
		DefaultConf: AutoOutOrderConf_Time;
		/** 预订单在等待N秒后出餐*/
		ReserveOrder: ReserveOrderConf;
		/** 自动出餐设置模板*/
		ConfTemplate?: AutoOutOrderConf_TemplateItem[] | null;
		/** 使用的出餐设置模板*/
		UseTemplate?: string | null;
		/** 不同时间段 具体时间及出餐设置 只有以上配置不符合条件时才会走到这*/
		Conf_Time: AutoOutOrderConf_Time[];
		/** 限制出餐速度的设置*/
		Conf_Slow: AutoOutOrderConf_slow;
}
