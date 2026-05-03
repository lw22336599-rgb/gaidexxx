import {SaleReturnType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/SaleReturnType";

/** 售后支持*/
export interface FoodAfterSaleConf {
		/** 退化类型支持*/
		ReturnType?: SaleReturnType | null;
}
