/** 营业收入*/
export interface Data_Revn {
		/** 月销量*/
		MonthlySales: number;
		/** 店铺评分*/
		ShopStore: number;
		/** 昨日收入*/
		YIncome: number;
		/** 昨日有效订单*/
		YdayOrderNum: number;
		/** 同行近30日订单同行平均值*/
		OdPeerAvg_30day: number;
		/** 近7日收*/
		Rev7Day: number;
		/** 近30日收*/
		Rev30Day: number;
		/** 昨日 商圈同行前收入*/
		YdayPeerRev: number;
		/** 商圈同行近30天收入*/
		Peer30DayRev: number;
}
