import {ScoreForecast_item} from "@/TsModel/Alien/Entity/Function/PFYC/ScoreForecast_item";

/** 上涨或下降预测*/
export interface ScoreForecast {
		/** 更新时间*/
		UpdateTime: Date;
		/** 星星数和产生值*/
		Items: ScoreForecast_item[];
}
