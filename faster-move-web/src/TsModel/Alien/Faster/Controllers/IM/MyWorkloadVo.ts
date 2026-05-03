/** 我的工作负载统计*/
export interface MyWorkloadVo {
		/** 客服ID*/
		adminId: string;
		/** 客服名称*/
		adminName: string;
		/** 待处理会话数*/
		pendingCount: number;
		/** 已回复会话数*/
		repliedCount: number;
		/** 总服务中会话数*/
		totalCount: number;
		/** 时间戳*/
		timestamp: Date;
}
