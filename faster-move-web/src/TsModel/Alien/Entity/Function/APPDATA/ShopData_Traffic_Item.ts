export interface ShopData_Traffic_Item {
		/** 指标名称,如曝光人数|入店人数|下单人数|入店转化率|下单转化率|收入|实付单均价*/
		name: string;
		/** 本店值*/
		_self: number;
		/** 商圈同行前(10%) 值*/
		area: number;
		/** 比昨日同时段*/
		yesterday: number;
}
