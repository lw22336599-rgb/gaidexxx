import {CombineGroupType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupType";
import {TG_CustomGroupFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_CustomGroupFoodItem";
import {CombineGroupRule} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupRule";

/** 团购-分组可选套餐,自定义菜品名版,团购商品需要*/
export interface TG_CustomGroupFood {
		/** 设置分组名*/
		GroupName: string;
		/** 分组类型 固定商品还是可选商品*/
		GroupType: CombineGroupType;
		/** 分组商品. 自定义套餐内容*/
		FoodItems: TG_CustomGroupFoodItem[];
		/** 分组选择规则 如 一个分组能重复选或选择的数量区间*/
		GroupRule?: CombineGroupRule | null;
}
