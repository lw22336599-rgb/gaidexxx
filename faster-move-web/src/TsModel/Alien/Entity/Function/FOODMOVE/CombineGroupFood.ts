import {CombineGroupType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupType";
import {CombineGroupFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupFoodItem";
import {CombineGroupRule} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupRule";

/** 分组可选套餐*/
export interface CombineGroupFood {
		/** 设置分组名*/
		GroupName: string;
		/** 分组类型 固定商品还是可选商品*/
		GroupType: CombineGroupType;
		/** 分组商品. 一样的一个商品只允许一个sku*/
		FoodItems: CombineGroupFoodItem[];
		/** 分组选择规则 如 一个分组能重复选或选择的数量区间*/
		GroupRule?: CombineGroupRule | null;
}
