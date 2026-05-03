/** 下单返卷*/
import {ActivityType_Jue_Base} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/YouHuiJue/ActivityType_Jue_Base";
export interface ActivityType_Jue_XDFJ extends ActivityType_Jue_Base {
		/** 订单要满多少钱才返卷*/
		FullPrice: number;
}
