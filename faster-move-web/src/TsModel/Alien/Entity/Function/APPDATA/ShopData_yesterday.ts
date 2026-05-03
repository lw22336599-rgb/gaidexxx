import {ShopAdData_yesterday} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopAdData_yesterday";

/** 昨日经营分析*/
export interface ShopData_yesterday {
		/** 月售订单量(当月1号到昨日的)*/
		month_sale: number;
		/** 评分*/
		score: number;
		/** 好评数*/
		count_hp?: number | null;
		/** 中评数量*/
		count_zp?: number | null;
		/** 差评数*/
		count_cp?: number | null;
		/** 店铺分*/
		shop_core: number;
		/** 超过多少同行*/
		peer_percent?: number | null;
		/** 商圈在同行中的排名*/
		peer_ranking?: number | null;
		/** 收入*/
		income: number;
		/** 相比前日收入*/
		income_y: number;
		/** 营业额*/
		turnover: number;
		/** 营业额相比前日*/
		turnover_y: number;
		/** 有效订单量*/
		order_cnt: number;
		/** 有效订单量-相比前日*/
		order_cnt_y: number;
		/** 活动补贴*/
		act_sub: number;
		/** 活动补贴-相比前日*/
		act_sub_y: number;
		/** 顾客实付均单价*/
		real_pay: number;
		/** 顾客实付均单价相比前日*/
		real_pay_y: number;
		/** 曝光人数*/
		show_people: number;
		/** 曝光人数-对比前日*/
		show_people_y: number;
		/** 进店转化率*/
		come_cro: number;
		/** 进店转化率-对比前日*/
		come_cro_y: number;
		/** 下单转化率*/
		order_cro: number;
		/** 下单转化率-对比前日*/
		order_cro_y: number;
		/** 下单人数*/
		order_people?: number | null;
		/** 下单人数-对比昨日*/
		order_people_y?: number | null;
		/** 老客户数量(老客户占比就用 old_people / order_people *100)*/
		old_people?: number | null;
		/** 老客户占比*/
		old_percent?: number | null;
		/** 昨日推广数据*/
		AdData?: ShopAdData_yesterday | null;
		/** 数据更新时间*/
		uptime: Date;
}
