/** 集点返卷*/
import {ActivityType_Jue_Base} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/YouHuiJue/ActivityType_Jue_Base";
export interface ActivityType_Jue_JDFJ extends ActivityType_Jue_Base {
		/** 多少天内集满N天 这里就是多少天*/
		TaskValidDays: number;
		/** 需要集满多少单*/
		SendCondition: number;
}
