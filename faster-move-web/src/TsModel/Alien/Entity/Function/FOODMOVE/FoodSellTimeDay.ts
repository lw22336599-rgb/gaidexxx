import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {HourMinuteRange} from "@/TsModel/Alien/Entity/Function/ZDTG/HourMinuteRange";

/** 表示在一个天内的售卖时间*/
export interface FoodSellTimeDay {
		/** 周几*/
		DayType: DayType;
		/** 一天中的售卖时段*/
		Ranges: HourMinuteRange[];
}
