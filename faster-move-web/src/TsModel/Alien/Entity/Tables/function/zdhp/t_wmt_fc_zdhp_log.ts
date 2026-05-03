import {EvaluationType} from "@/TsModel/Alien/Entity/Enums/EvaluationType";

import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_zdhp_log extends BaseSysExTime {
		/** 所属店铺*/
		shop: string;
		/** 评价类型*/
		pj_type: EvaluationType;
		/** 评价id*/
		pj_id: string;
		/** 评价内容*/
		pj_str: string;
		/** 回评内容*/
		pj_rep: string;
		/** 评价时间*/
		pj_time: Date;
		/** 评分*/
		score: number;
		/** 回评结果*/
		rep_res: string;
}
