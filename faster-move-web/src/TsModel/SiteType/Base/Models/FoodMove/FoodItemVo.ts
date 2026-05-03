import {ParsePropertiesParms} from "@/TsModel/SiteType/Base/ParsePropertiesParms";
import {ParsePropertiesXParms} from "@/TsModel/SiteType/Base/ParsePropertiesXParms";
import {t_wmt_fc_fdmv_task_fdcopy} from "@/TsModel/Alien/Entity/Tables/function/food_move/task/t_wmt_fc_fdmv_task_fdcopy";

/** 竞对模式前端向后端传的单个商品结构*/
import {FoodItemBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItemBase";
export interface FoodItemVo extends FoodItemBase {
		/** id*/
		id: string;
		/** 此商品的分类官方id*/
		GroupOffId: string;
		/** 多分组官方id*/
		GroupMultipOffId: string[];
		/** 商品属性 如:主料,辅料 Properties1 与 Properties2 任何一样指定属性*/
		Properties1?: ParsePropertiesParms[] | null;
		/** 商品属性 如:主料,辅料 等 属性是NamePath 模式 饿了么就这样的*/
		Properties2?: ParsePropertiesXParms[] | null;
		/** 此商品的复制任务信息(是否成功,异常信息,都可以在里面拿),可能为空*/
		CopyTask?: t_wmt_fc_fdmv_task_fdcopy | null;
		Msg?: string | null;
}
