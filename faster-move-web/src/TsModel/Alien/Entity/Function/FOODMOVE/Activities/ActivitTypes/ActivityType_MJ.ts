import {ActivityCargeItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityCargeItem";

/** 满减活动类型*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_MJ extends ActivityItemBase {
		/** 满减具体项*/
		Carges: ActivityCargeItem[];
}
