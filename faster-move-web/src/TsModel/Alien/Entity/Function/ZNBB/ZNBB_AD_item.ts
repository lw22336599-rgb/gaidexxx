export interface ZNBB_AD_item {
		/** 推广类型*/
		Type: string;
		/** 更新时间*/
		UpTime: Date;
		/** 消费金额*/
		Cost: number;
		/** 单次进店成本*/
		CostPerVisit: number;
		/** 曝光提升数*/
		ShowCount: number;
		/** 进店提升数*/
		Enter: number;
		/** 提升的订单数*/
		OrdInc: number;
		/** 进店转化率*/
		ConvRate: number;
}
