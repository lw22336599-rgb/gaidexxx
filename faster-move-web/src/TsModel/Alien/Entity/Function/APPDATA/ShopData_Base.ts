export interface ShopData_Base {
		/** 收入*/
		income: number;
		/** 营业额*/
		turnover: number;
		/** 有效订单量*/
		order_num: number;
		/** 曝光人数*/
		show_people: number;
		/** 进店转化率*/
		come_cro: number;
		/** 下单转化率*/
		order_cro: number;
		/** 数据更新时间*/
		uptime: Date;
}
