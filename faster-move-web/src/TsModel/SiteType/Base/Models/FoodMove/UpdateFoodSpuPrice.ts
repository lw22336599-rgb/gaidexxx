import {UpdateValueType} from "@/TsModel/SiteType/Base/Models/FoodMove/UpdateValueType";

/** 把所有商品id的sku值改成指定的金额*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodSpuPrice extends FoodManageParmsBase {
		task: string;
		/** 规格id 如果不选择代表全部*/
		food_ids?: string[] | null;
		/** 设置为涨,如果为false 就是降 为null 代表不进行加减直接更改金额*/
		mark_up?: boolean | null;
		/** 改变方式 百分比? 固定金额*/
		change_mode: UpdateValueType;
		/** 改变值*/
		value: number;
}
