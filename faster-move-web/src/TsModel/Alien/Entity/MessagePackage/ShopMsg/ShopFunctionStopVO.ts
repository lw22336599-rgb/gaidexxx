/** 店铺功能停止VO*/
export interface ShopFunctionStopVO {
		/** 店铺ID*/
		ShopId: string;
		/** 功能代码*/
		FunctionCode: string;
		/** 停止原因*/
		Reason?: string | null;
		/** 停止时间*/
		StopTime: Date;
}
