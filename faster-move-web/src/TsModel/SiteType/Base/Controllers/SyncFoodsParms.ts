import {t_wmt_fc_fdmv_rule} from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_rule";
import {FoodMoveConfBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConfBase";

/** 同步商品参数*/
export interface SyncFoodsParms {
		/** 任务id*/
		taskId: string;
		/** 商品id t_wmt_fc_fdmv_food.id*/
		foodIds?: string[] | null;
		/** 表示复制这些分组下的商品 foodIds 与 groupIds 只能有一个生效*/
		groupIds?: string[] | null;
		/** 追加规则*/
		appendRules?: t_wmt_fc_fdmv_rule[] | null;
		/** 商品复制完后重置顺序*/
		indexSet: boolean;
		DotCheck: boolean;
		/** 启用去水印(会覆盖当前任务设置)*/
		RemoveWaterMark?: boolean | null;
		/** 如果这里不为空  RemoveWaterMark 将失效*/
		CopyConf?: FoodMoveConfBase | null;
		/** 复制完马上复制活动*/
		SyncActivity?: boolean | null;
}
