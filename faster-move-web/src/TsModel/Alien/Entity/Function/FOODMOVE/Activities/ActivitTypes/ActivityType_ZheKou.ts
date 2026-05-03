import {PickType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/PickType";
import {ActivityType_ZheKou_Item} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_ZheKou_Item";

/** 折扣活动*/
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";
export interface ActivityType_ZheKou extends ActivityItemBase {
		/** 美团提示的是否覆盖原有活动配置,直接为true好了*/
		OverConf: boolean;
		/** 活动仅限的取货方式*/
		PickType: PickType;
		/** 折扣商品*/
		FoodItems: ActivityType_ZheKou_Item[];
}
