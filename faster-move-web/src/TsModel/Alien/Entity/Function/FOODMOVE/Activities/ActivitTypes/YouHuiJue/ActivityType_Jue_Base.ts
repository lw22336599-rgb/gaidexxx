import {ActivityType_JueType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/YouHuiJue/ActivityType_JueType";
import {ActivityType_Jue_Item} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/YouHuiJue/ActivityType_Jue_Item";
import {ActivityType_Jue_Food} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/YouHuiJue/ActivityType_Jue_Food";

/** 收藏有礼*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_Jue_Base extends ActivityItemBase {
		/** 卷类型*/
		JueType: ActivityType_JueType;
		/** 卷列表*/
		JueItems: ActivityType_Jue_Item[];
		/** 商品卷时使用*/
		Foods?: ActivityType_Jue_Food[] | null;
}
