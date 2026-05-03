/** IM订单商品项（简化版）*/
export interface ImOrderFoodItem {
		/** 商品名称*/
		FoodName: string;
		/** 商品单价*/
		UnitPrice: number;
		/** 商品数量*/
		Quantity: number;
		/** 规格信息（可选，如："大份"、"加辣"等）*/
		SpecInfo?: string | null;
}
