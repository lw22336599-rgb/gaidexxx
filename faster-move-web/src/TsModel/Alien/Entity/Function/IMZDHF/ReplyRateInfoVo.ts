import {ReplyRateInfoItem} from "@/TsModel/Alien/Entity/Function/IMZDHF/ReplyRateInfoItem";

/** 平台回复率统计*/
export interface ReplyRateInfoVo {
		/** 数据更新日期*/
		uptime: Date;
		/** 回复率信息列表*/
		reply_rate: ReplyRateInfoItem[];
}
