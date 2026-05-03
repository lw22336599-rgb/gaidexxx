import {FoodGroupDataStateItem} from "@/TsModel/SiteType/Base/Controllers/FoodGroupDataStateItem";

/** 微信数据转换回显示到前端的数据对像*/
export interface ParseWxDataResultVo {
		/** 每个分组下的商品数据状态*/
		FoodGroupDataStates: FoodGroupDataStateItem[];
}
