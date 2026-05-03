import {ActivityType_JPSF_SetType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_JPSF_SetType";

/** 减配送费*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_JPSF <T> extends ActivityItemBase {
		/** 减配送费的方式*/
		SetType: ActivityType_JPSF_SetType;
		/** 具体设置*/
		Carges: T[];
}
