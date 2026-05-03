import {UpdateFoodNameMode} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodNameMode";

import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodNameParms extends FoodManageParmsBase {
		Mode: UpdateFoodNameMode;
		/** 数据库中的商品id 非offid*/
		FoodIds: string[];
		/** 前辍*/
		Prefix?: string | null;
		/** 后辍*/
		Suffix?: string | null;
		/** 原文字*/
		OriginalText?: string | null;
		/** 替换文字 如果是完全重命名则是新的商品名*/
		ReplacementText?: string | null;
}
