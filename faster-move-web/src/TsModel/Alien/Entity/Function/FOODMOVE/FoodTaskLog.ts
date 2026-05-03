import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";

/** 商品复制日志*/
export interface FoodTaskLog {
		/** 日志i*/
		id: string;
		/** 保留参数*/
		food_souse: FoodItem;
		/** 保留参数*/
		food_update: FoodItem;
		/** 老店商品名称*/
		food_old: string;
		/** 复制到新店的spu*/
		food_new: string;
		/** 如果失败了代表错误信息*/
		err_msg: string;
		/** 是否成功*/
		succeed: boolean;
		/** 商品id*/
		food_id: string;
}
