import {UpdateSpuInSkuItem} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateSpuInSkuItem";
import {DiscountTypeEnum} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/DiscountTypeEnum";
import {AdjustTypeEnum} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/AdjustTypeEnum";
import {LimitTypeEnum} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/LimitTypeEnum";
import {RoundTypeEnum} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/RoundTypeEnum";

/** 更新商品折扣的参数*/
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
export interface UpdateFoodDiscountParms extends FoodManageParmsBase {
		/** 要更新的 商品和sku 如果Targets 为空则更新全部商品*/
		Targets?: UpdateSpuInSkuItem[] | null;
		/** 折扣方式（如：折扣率、折扣价）*/
		DiscountType: DiscountTypeEnum;
		/** 调整方式（上下浮动/一口价）*/
		AdjustType: AdjustTypeEnum;
		/** 折扣价*/
		DiscountPrice?: number | null;
		/** 折扣率*/
		DiscountRate?: number | null;
		/** 每日库存限购类型*/
		DailyStockLimitType: LimitTypeEnum;
		/** 每日库存限购数量*/
		DailyStockLimitCount?: number | null;
		/** 每单限购类型*/
		OrderLimitType: LimitTypeEnum;
		/** 每单限购数量*/
		OrderLimitCount?: number | null;
		/** 活动名称*/
		ActivityName: string;
		/** 活动开始时间*/
		StartTime: Date;
		/** 活动结束时间*/
		EndTime: Date;
		/** 取整方式*/
		RoundType: RoundTypeEnum;
}
