import {ScoreStatistics} from "@/TsModel/Alien/Entity/Function/PFYC/ScoreStatistics";
import {ScoreForecast} from "@/TsModel/Alien/Entity/Function/PFYC/ScoreForecast";

/** 首页数据一*/
export interface Home {
		/** 当前评分*/
		Now: number;
		/** 明天评分*/
		Tomorrow: number;
		/** 评价统计*/
		Statistics?: ScoreStatistics[] | null;
		/** 上涨预测*/
		UpForecast?: ScoreForecast | null;
		/** 下降预测*/
		DowForecast?: ScoreForecast | null;
}
