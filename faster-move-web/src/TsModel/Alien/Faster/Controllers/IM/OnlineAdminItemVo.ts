/** 在线客服信息项*/
export interface OnlineAdminItemVo {
		/** 客服ID*/
		id: string;
		/** 客服名称*/
		userName: string;
		/** 当前服务中的会话数*/
		activeSessionCount: number;
		/** 是否在线*/
		isOnline: boolean;
		/** 最后活跃时间*/
		lastActiveAt?: Date | null;
}
