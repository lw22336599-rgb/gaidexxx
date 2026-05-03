export interface AdDataV2 {
		/** 推广曝光量*/
		ad_show_num: number;
		/** 推广曝光量-昨日同时段*/
		ad_show_num_y: number;
		/** 推广进店量*/
		ad_in_num: number;
		/** 推广进店量-昨日同时段*/
		ad_in_num_y: number;
		/** 推广进店率*/
		ad_in_ratio: number;
		/** 推广进店率-昨日同时段*/
		ad_in_ratio_y: number;
		/** 单次进店成本*/
		ad_in_cost: number;
		/** 单次进店成本-昨日同时段*/
		ad_in_cost_y: number;
		/** 推广消耗(当前消耗)*/
		ad_pay: number;
		/** 当前出价*/
		ad_bid: number;
		/** 推广余额*/
		ad_balance: number;
		/** 此数据更新时间*/
		uptime: Date;
}
