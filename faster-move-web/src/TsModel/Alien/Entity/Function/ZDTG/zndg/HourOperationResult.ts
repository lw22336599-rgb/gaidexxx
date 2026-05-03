/** 每个小时执行一次的结果*/
export interface HourOperationResult {
		/** 表示今日预算按小时递增调已ok*/
		HasCloseAd?: boolean | null;
		/** 开始出价值*/
		StartBidding?: number | null;
}
