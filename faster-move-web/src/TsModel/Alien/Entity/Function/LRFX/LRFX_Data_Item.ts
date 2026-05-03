import {Food} from "@/TsModel/Alien/Entity/Function/CPFX/Food";

/** 某个时间段的数据集合*/
export interface LRFX_Data_Item {
		/** 营收*/
		Income: number;
		/** 推广费用*/
		AdCost: number;
		/** 菜品包含分组和菜品*/
		Food: Food;
}
