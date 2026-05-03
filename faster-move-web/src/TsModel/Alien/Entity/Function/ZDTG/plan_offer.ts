import {HourMinuteRange} from "@/TsModel/Alien/Entity/Function/ZDTG/HourMinuteRange";

/** 出价对像*/
export interface plan_offer {
		TimeRange: HourMinuteRange;
		/** 出价起步*/
		start_offer: number;
		/** 最大出价*/
		end_offer: number;
		/** 预算 超过这个值 将放弃投放*/
		budget: number;
}
