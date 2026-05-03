import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {plan_offer} from "@/TsModel/Alien/Entity/Function/ZDTG/plan_offer";

/** 智能推广自定义策略*/
export interface AutoAdType_conf_zdycy {
		/** 在以下日期类型中投放*/
		DayTypes: DayType[];
		/** 智能推广策略列表*/
		Plan_Offers: plan_offer[];
}
