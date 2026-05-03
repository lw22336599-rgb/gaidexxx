import * as Comm from '@/TsModel/Comm/Comm';

/** 决策结果 通过 HourContrastData 分析后的结果*/
export interface DecisionResult {
		/** 为每个小时分多少钱*/
		HourMoneyPercent: Comm.Dictionary<number, number>;
		/** 每个小时需要多少曝光量 从起步价开始,小于这个曝光量就要继续加价*/
		HourShowCount: Comm.Dictionary<number, number>;
		/** 每小时调价递增 , 按百分比修改每日预算,
比如每日预算100 第一个小时占10% 第一小时调10元, 第二小时占20% 就调30元...以此类推 到最后一小时肯定就是调价100*/
		HourBudgetAdd: Comm.Dictionary<number, number>;
}
