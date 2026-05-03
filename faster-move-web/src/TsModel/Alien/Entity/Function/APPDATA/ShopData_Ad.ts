export interface ShopData_Ad {
		/** 推广账号余额*/
		balance: number;
		/** 已消费*/
		pay_val: number;
		/** 曝光提升数*/
		show_count: number;
		/** 进店提升数*/
		in_shop: number;
		/** 进店率*/
		in_rate?: number | null;
		/** 数据更新时间*/
		uptime: Date;
}
