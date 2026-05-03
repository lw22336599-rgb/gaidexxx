import {ImOrderFoodItem} from "@/TsModel/Alien/Entity/Function/IM/ImOrderFoodItem";

/** IM订单详情VO（通用，适用于所有平台）
用于在IM端显示订单基本信息*/
export interface ImOrderDetailVo {
		/** 平台订单号*/
		SiteOrderId: string;
		/** 订单日序号（当天第几单）*/
		DaySeq?: number | null;
		/** 订单状态描述*/
		StatusDesc: string;
		/** 下单时间（格式化字符串）*/
		OrderTimeFmt: string;
		/** 预计送达时间（格式化字符串）*/
		ExpectTimeFmt: string;
		/** 店铺名称*/
		ShopName: string;
		/** 收货人姓名*/
		RecipientName: string;
		/** 收货人电话（可能脱敏，如："手机尾号8158"）*/
		RecipientPhone: string;
		/** 收货地址*/
		RecipientAddress: string;
		/** 距离描述（如："<1km"）*/
		DistanceText: string;
		/** 商品种类和数量描述（如："2种商品，共51件"）*/
		FoodSummary: string;
		/** 订单商品列表*/
		FoodItems: ImOrderFoodItem[];
		/** 顾客实际支付金额*/
		UserPayAmount: number;
		/** 商家预计收入金额*/
		SettleAmount: number;
		/** 打包费*/
		BoxFee?: number | null;
		/** 配送费*/
		ShippingFee?: number | null;
		/** 商品优惠后金额*/
		FoodAmount?: number | null;
		/** 佣金金额*/
		CommissionAmount?: number | null;
		/** 顾客备注*/
		Remark: string;
		/** 配送员姓名*/
		RiderName: string;
		/** 配送标签（如:"美团跑腿"、"蜂鸟配送"等）*/
		DeliveryTag: string;
		/** 配送状态描述（如："配送中"、"配送已取消"等）*/
		DeliveryStatus: string;
}
