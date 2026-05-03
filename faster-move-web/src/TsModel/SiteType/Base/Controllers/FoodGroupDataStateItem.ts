import {FoodDataStateItem} from "@/TsModel/SiteType/Base/Controllers/FoodDataStateItem";
import * as Comm from '@/TsModel/Comm/Comm';

export interface FoodGroupDataStateItem {
		/** 分组官方id*/
		group_offid: string;
		/** spu 和 数据状态*/
		FoodDataState: Comm.Dictionary<string, FoodDataStateItem>;
}
