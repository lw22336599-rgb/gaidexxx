/** 客服工作负载返回对象*/
export interface AdminWorkloadVo {
		/** 客服ID*/
		adminId: string;
		/** 当前工作负载（会话数）*/
		workload: number;
		/** 时间戳*/
		timestamp: Date;
}
