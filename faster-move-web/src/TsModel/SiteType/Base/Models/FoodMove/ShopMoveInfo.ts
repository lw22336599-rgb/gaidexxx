import {ShopDecorate} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopDecorate";
import {ActivityCountItem} from "@/TsModel/SiteType/Base/Models/FoodMove/ActivityCountItem";
import {FoodGroupVoItem} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodGroupVoItem";

/** 获取一个店的详细信息 装修信息,活动列表,商品分组,商品列表*/
export interface ShopMoveInfo {
		/** 店铺装修信息*/
		DecorateInfo: ShopDecorate;
		/** 活动列表 为了防止关联商品过大,在获取时应该显示显示数量*/
		ActivityList: ActivityCountItem[];
		/** 店铺分组,默认会自动加载第一个分组的部列表*/
		FoodGroups: FoodGroupVoItem[];
		/** 真实商品数量数量 存在与数据库中的*/
		RealFoodCount: number;
}
