import {LRFX_Cost_Food} from "@/TsModel/Alien/Entity/Function/LRFX/LRFX_Cost_Food";
import {LRFX_CustomCost_Group} from "@/TsModel/Alien/Entity/Function/LRFX/LRFX_CustomCost_Group";

/** 利润分析的成本类 保存设置时只需要提供这个*/
export interface LRFX_Cost_Conf {
		Foods: LRFX_Cost_Food[];
		CustomCost_Items: LRFX_CustomCost_Group[];
}
