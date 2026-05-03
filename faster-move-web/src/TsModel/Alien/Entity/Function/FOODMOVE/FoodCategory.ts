import {CategoryFromType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CategoryFromType";

/** 商品类目*/
export interface FoodCategory {
		/** 类目名称，可能为空*/
		CategoryName?: string | null;
		/** 商品类目id(官方id)*/
		CategoryId: string;
		/** 类目名称路径 可能没有*/
		Path?: string | null;
		/** 类目来源*/
		FromType?: CategoryFromType | null;
}
