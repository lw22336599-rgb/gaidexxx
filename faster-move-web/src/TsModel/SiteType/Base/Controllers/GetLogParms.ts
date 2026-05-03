import {FoodMoveActionType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveActionType";

/** 获取日志*/
import {PageParmsVoBase} from "@/TsModel/Alien/Entity/GlobalModel/PageParmsVoBase";
export interface GetLogParms extends PageParmsVoBase {
		/** 获取日志*/
		task: string;
		/** 日志操作类型*/
		log_type?: FoodMoveActionType | null;
		/** 关键词*/
		word: string;
}
