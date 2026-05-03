/** 会话统计信息*/
export interface SessionSummaryVo {
		/** 店铺ID*/
		ShopId: string;
		/** 总会话数*/
		TotalSessionCount: number;
		/** 进行中的会话数（已回复）*/
		OpenSessionCount: number;
		/** 待处理的会话数*/
		PendingSessionCount: number;
		/** 已关闭的会话数*/
		ClosedSessionCount: number;
		/** 今日新增会话数*/
		TodayNewSessionCount: number;
}
