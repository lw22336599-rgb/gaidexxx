import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_imzdhf_log extends BaseSysExTime {
		/** 所属店铺*/
		shop: string;
		/** 发送人id*/
		sender_uid: string;
		/** 订单id 如果为空 表明用户未下单*/
		order_id?: string | null;
		/** 已回复数量 用于判断是否还要向对方回复内容*/
		send_count: number;
		/** 收到消息*/
		receive?: string | null;
		/** 回复内容*/
		reply?: string | null;
}
