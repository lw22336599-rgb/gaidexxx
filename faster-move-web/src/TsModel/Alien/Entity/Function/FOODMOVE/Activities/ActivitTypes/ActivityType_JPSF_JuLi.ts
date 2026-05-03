/** 减配送费-按距离减*/
import {ActivityType_JPSF_PolicyBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_JPSF_PolicyBase";
export interface ActivityType_JPSF_JuLi extends ActivityType_JPSF_PolicyBase {
		/** 开始距离（km）*/
		Start_km: number;
		/** 结束距离（km）*/
		End_km: number;
		/** 阶梯距离 从1开始*/
		Index: number;
}
