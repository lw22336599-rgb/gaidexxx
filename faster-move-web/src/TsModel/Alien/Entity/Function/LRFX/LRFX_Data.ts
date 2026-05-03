import {LRFX_Data_Item} from "@/TsModel/Alien/Entity/Function/LRFX/LRFX_Data_Item";

/** 显示数据的对像*/
export interface LRFX_Data {
		Yday: LRFX_Data_Item;
		Last7: LRFX_Data_Item;
		Last30: LRFX_Data_Item;
}
