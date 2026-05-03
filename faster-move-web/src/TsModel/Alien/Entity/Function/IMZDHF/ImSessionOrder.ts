/** 会话中的订单*/
export interface ImSessionOrder {
		/** 在当天中的这个订单的排序*/
		DaySeq?: number | null;
		/** 订单id*/
		OrderId: string;
}
