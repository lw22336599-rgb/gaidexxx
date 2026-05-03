/** 未读消息统计*/
export interface UnreadCountVo {
		/** 店铺ID*/
		ShopId?: string | null;
		/** 总未读消息数*/
		TotalUnreadCount: number;
		/** 未读会话数*/
		UnreadSessionCount: number;
}
