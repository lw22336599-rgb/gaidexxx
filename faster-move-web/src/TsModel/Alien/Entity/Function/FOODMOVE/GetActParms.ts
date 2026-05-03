import {TaskProgressBase} from "@/TsModel/Alien/Common/TaskProgressBase";
import {ActivityItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityItemBase";

/** 获取活动列表参数*/
export interface GetActParms {
		/** 进度条*/
		CallProcess?: TaskProgressBase | null;
		/** 活动处理对像*/
		DisQueueTask: Alien.Common.QueueTaskAsync<ActivityItemBase>;
}
