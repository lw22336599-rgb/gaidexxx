import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";

/** 老板推荐*/
export interface BossRecommend {
		/** 如果此项为空或无内容就用 推荐选项 美团和饿了么都支持的*/
		LinkFoods?: FoodItem[] | null;
}
