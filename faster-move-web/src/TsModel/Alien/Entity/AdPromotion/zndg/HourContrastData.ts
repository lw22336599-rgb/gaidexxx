import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import * as Comm from '@/TsModel/Comm/Comm';
import {DecisionResult} from "@/TsModel/Alien/Entity/Function/ZDTG/zndg/DecisionResult";
import {HourOperationResult} from "@/TsModel/Alien/Entity/Function/ZDTG/zndg/HourOperationResult";
import {MinuteOperationResult} from "@/TsModel/Alien/Entity/Function/ZDTG/zndg/MinuteOperationResult";

export interface HourContrastData <T> {
		/** 对比的小时 如果为null 证明没成功*/
		Hour?: number | null;
		/** 历史中最高记录的当前小时数据*/
		MaxHourData?: T | null;
		/** 当前小时数据,这个是实时更新的*/
		NowHourData?: T | null;
		/** 记录今天的数据 如果这个变了或为空 哪么*/
		ToDay?: any | null;
		/** 今天周几 或是不是节假日*/
		ToDayType: DayType;
		/** 计算出能比对的五天数据*/
		FiveDayData?: Comm.Dictionary<any, T[]> | null;
		/** 决策结果*/
		Result?: DecisionResult | null;
		/** 各种操作执行结是, 按小时会重置一次 也就是记录需要从平台操作返回的值*/
		HourOptResult?: HourOperationResult | null;
		/** 每分钟执行的结果*/
		MinuteOptResult: MinuteOperationResult;
}
