import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";

/** 活动类型统计*/
export interface ActivityCountItem {
		/** 活动类型*/
		Type: ActivityType;
		/** 活动名称*/
		Name: string;
		/** 总数*/
		Total: number;
}
