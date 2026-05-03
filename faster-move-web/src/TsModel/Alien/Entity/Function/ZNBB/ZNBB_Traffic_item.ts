import {GuestMoels} from "@/TsModel/Alien/Entity/Function/ZNBB/GuestMoels";

/** 流量*/
export interface ZNBB_Traffic_item {
		/** 代表是哪天的数据*/
		Time: Date;
		/** 全部客户*/
		All: GuestMoels;
		/** 新客户*/
		New: GuestMoels;
		/** 老客户*/
		Old: GuestMoels;
}
