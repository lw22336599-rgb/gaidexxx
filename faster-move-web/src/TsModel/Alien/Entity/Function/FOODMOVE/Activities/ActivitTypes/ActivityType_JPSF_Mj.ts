/** 减配送费-按价格满减*/
import {ActivityType_JPSF_PolicyBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_JPSF_PolicyBase";
export interface ActivityType_JPSF_Mj extends ActivityType_JPSF_PolicyBase {
		/** 原价满多少*/
		WhenVal: number;
		/** 满减阶梯索引,从1开始*/
		Index: number;
		/** 在这个阶梯直接免除运费*/
		Free: boolean;
}
