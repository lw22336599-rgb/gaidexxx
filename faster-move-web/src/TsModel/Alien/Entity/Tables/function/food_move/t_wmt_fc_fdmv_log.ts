import {FoodMoveActionType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveActionType";

/** 店铺复制日志*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_log extends BaseSysExTime, IFdmvTaskEntity {
		/** 任务id*/
		task: string;
		/** 在*/
		spu_id?: string | null;
		/** 针对商品名称可能为空(应始终保持是老店的商品名)*/
		food_name?: string | null;
		/** 日志操作类型*/
		log_type: FoodMoveActionType;
		/** 消息. 支持长文本 最好能截断*/
		msg: string;
}
