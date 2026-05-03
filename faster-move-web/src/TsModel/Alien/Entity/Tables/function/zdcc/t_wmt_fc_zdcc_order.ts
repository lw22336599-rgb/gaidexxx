import {OutOrderState} from "@/TsModel/Alien/Entity/Enums/OutOrderState";
import {OrderType} from "@/TsModel/Alien/Entity/Enums/OrderType";

/** 自动出餐的订单*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_zdcc_order extends BaseSysExTime {
		/** 订单序号,同步平台*/
		dayseq: number;
		/** 所属店铺 也就是t_wmt_shop_list.id*/
		shop_id: string;
		/** 订单id 美团或饿了么应通用 也是 orderViewId*/
		order_id: string;
		/** 订单时间*/
		order_time: Date;
		/** 出餐时间 也就是根据系统设置的出餐时间*/
		out_time: Date;
		/** 出餐状态*/
		state: OutOrderState;
		/** 出餐完成时间*/
		out_endTime?: Date | null;
		/** 订单价格(目标是保留字段)*/
		price?: number | null;
		/** 订单类型*/
		type?: OrderType | null;
		/** 消息*/
		msg: string;
}
