import {FoodCategory} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodCategory";
import {FoodProperty} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodProperty";
import {t_fdmv_ctgry} from "@/TsModel/Alien/Entity/Tables/function/food_move/t_fdmv_ctgry";

/** 类目推荐结果*/
export interface CategoryRecomendResult {
		/** 最终用的关键词*/
		KeyWords: string;
		/** 类目*/
		Category: FoodCategory;
		/** 商品属性列表 有可能推荐了属性返回*/
		Properties?: FoodProperty[] | null;
		/** 有的平台要嗵在推荐的同时. 就返回了类目树.如果需要可以顺便处理下*/
		CategoryTree?: Alien.Entity.ModelSingleTree<t_fdmv_ctgry> | null;
}
