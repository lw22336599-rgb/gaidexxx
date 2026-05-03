import {HourRange} from "@/TsModel/Alien/Entity/Function/ZDTG/HourRange";
export interface AutoOutOrderConf_Time extends HourRange {
		/** 这个时间段的名称*/
		title: string;
		/** 正常订单在下单后等待N秒后 操作自动出餐操作*/
		WaitSecond: number;
}
