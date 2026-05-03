import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {EvaluationType} from "@/TsModel/Alien/Entity/Enums/EvaluationType";
import {AppealStatus} from "@/TsModel/Alien/Entity/Enums/AppealStatus";

/** 评价申诉日志表*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_pjss_log extends BaseSysExTime {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 店铺ID*/
		shop: string;
		/** 店铺OffId*/
		shop_offid: string;
		/** 评价ID(offid)*/
		pj_offid: string;
		/** 评价内容*/
		pj_str: string;
		/** 评价分数*/
		score: number;
		/** 评价类型*/
		pj_type: EvaluationType;
		/** 评价时间*/
		pj_time: Date;
		/** 申诉状态*/
		appeal_status?: AppealStatus | null;
		/** 申诉结果说明*/
		appeal_result?: string | null;
}
