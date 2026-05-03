/** 每分钟执行一次的结果*/
export interface MinuteOperationResult {
		/** 当前需要出价的值 如果变化就把 this.SetBidding 设置为false*/
		Bidding: number;
		/** 对于当前需出的价是否已设置成功*/
		SetBidding?: boolean | null;
		/** 当前 分钟数 如果变化了. 以上SetBidding值要重置*/
		NowMinute: number;
}
