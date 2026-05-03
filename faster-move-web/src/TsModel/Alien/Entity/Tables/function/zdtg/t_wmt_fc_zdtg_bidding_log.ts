import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_zdtg_bidding_log extends BaseSysExTime {
		/** 店铺id 也就是t_wmt_shop_list.id*/
		shop: string;
		/** 调价值*/
		val: number;
		/** 是否为追加价格*/
		is_add: boolean;
		/** 调价原因*/
		why: string;
		/** 出价时间*/
		bidding_time: Date;
}
