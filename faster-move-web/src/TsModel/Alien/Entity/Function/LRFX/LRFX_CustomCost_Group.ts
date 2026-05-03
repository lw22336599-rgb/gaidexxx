import {LRFX_CustomCost_Item} from "@/TsModel/Alien/Entity/Function/LRFX/LRFX_CustomCost_Item";

/** 成本分组*/
export interface LRFX_CustomCost_Group {
		/** 分组名*/
		Name: string;
		/** 子项成本*/
		Items: LRFX_CustomCost_Item[];
}
