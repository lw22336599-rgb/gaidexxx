import {PropertyAndValues} from "@/TsModel/Alien/Entity/Function/FOODMOVE/PropertyAndValues";

export interface GetFoodPrtyParms {
		/** 最小相似度(百分比) 默认90*/
		MinSimilarity?: number | null;
		/** 新平台的属性及属性值列表*/
		OldPrtys: PropertyAndValues[];
		/** 新平台的属性以及可选属性值列表*/
		NewPrtys: PropertyAndValues[];
}
