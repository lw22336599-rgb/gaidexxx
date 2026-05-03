import {FoodSkuSimpleItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuSimpleItem";
import {DiscountType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/DiscountType";

/** 超值换购的商品项*/
export interface ActivityType_CZHG_FoodItem {
		/** 商品*/
		Sku: FoodSkuSimpleItem;
		/** 优惠方式*/
		DisType: DiscountType;
		/** 全部按十折换算的折扣率*/
		Discount: number;
		/** 折扣后的真实价格*/
		Benefit: number;
		/** 限购份数 不限购就是小于1*/
		OrderLimit: number;
		/** 每日库存限量 如果小于1就是不限量*/
		DayLimit: number;
}
