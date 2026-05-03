import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 自动出餐订单消息*/
export interface AutoOutOrderMessage {
		/** 订单ID*/
		OrderId: string;
		/** 店铺ID*/
		ShopId: string;
		/** 店铺类型 (如: 美团, 饿了么)*/
		ShopType: ShopType;
		/** 功能编码, 固定为 "ZDCC"*/
		FunctionCode: string;
		/** 订单时间*/
		OrderTime: Date;
		/** 计算出的出餐时间*/
		OutTime: Date;
		/** 订单价格*/
		Price?: number | null;
		/** 订单类型 (对应 OrderType 枚举的整型值)*/
		OrderType?: number | null;
		/** 订单序号, 同步平台*/
		DaySeq: number;
}
