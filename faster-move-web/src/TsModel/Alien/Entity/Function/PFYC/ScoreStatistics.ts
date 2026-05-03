import {StarType} from "@/TsModel/Alien/Entity/Function/PFYC/StarType";

/** 评价统计*/
export interface ScoreStatistics {
		/** 几星评价*/
		ScoreType: StarType;
		/** 近30日收到条数*/
		Num: number;
		/** 昨日新增N条*/
		Yesterday: number;
}
