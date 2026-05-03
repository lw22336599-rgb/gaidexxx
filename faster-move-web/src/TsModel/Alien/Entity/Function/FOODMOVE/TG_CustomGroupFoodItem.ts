import {UintType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/UintType";

export interface TG_CustomGroupFoodItem {
		/** 商品名 自定义的*/
		FoodName: string;
		/** 需要加价*/
		Price: number;
		/** 数量*/
		Count: number;
		/** 单位*/
		UintType: UintType;
		/** 如果UintType 中没有的类型就在这里记录*/
		UintTypeStr: string;
		/** 规格 规格是指对菜品的克重、大小等方面描述，如：200g、10-12cm、大份、小份、20串*/
		Spec?: string | null;
}
