import {HourMinute} from "@/TsModel/Alien/Entity/Function/ZDTG/HourMinute";

/** 每日可用时段(支持次日)*/
export interface TG_DailyTimeSlot {
		/** 开始时间*/
		StartTime?: HourMinute | null;
		/** 结束时间*/
		EndTime?: HourMinute | null;
		/** 结束时间是否次日*/
		IsNextDay: boolean;
}
