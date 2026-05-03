import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";

/** 智能模式配置*/
export interface AutoAdType_conf_znms {
		/** 在以下日期类型中投放*/
		DayTypes: DayType[];
		/** 每日预算*/
		DayBudget: number;
		/** 其他 设置. 如定向加价 由平台给出设置项*/
		OtherConf?: string | null;
}
