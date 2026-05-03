import {FoodStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodStatusType";
import {FoodImage} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodImage";
import {FoodVideo} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodVideo";
import {FoodCategory} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodCategory";
import {FoodSpecification} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSpecification";
import {FoodSkuItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuItem";
import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {FoodSellTimeDay} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSellTimeDay";
import {FoodLableItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodLableItem";
import {CombineFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineFoodItem";
import {CombineGroupFood} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineGroupFood";
import {TG_CustomGroupFood} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_CustomGroupFood";
import {CombineCustomFoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/CombineCustomFoodItem";
import {FoodType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodType";
import * as Comm from '@/TsModel/Comm/Comm';
import {FoodAfterSaleConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodAfterSaleConf";
import {PropertySubValueItem} from "@/TsModel/SiteType/Base/PropertySubValueItem";
import {ParsePropertiesParms} from "@/TsModel/SiteType/Base/ParsePropertiesParms";
import {TG_UseRuleConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/TG_UseRuleConf";
import {NumScope} from "@/TsModel/Alien/Entity/NumScope";

/** 就是商品详细信息了 增删改，与多平台共标准*/
export interface FoodItemBase {
		/** 官方平台的商品id 也就是spuid*/
		SpuId: string;
		/** 为方便商家管理商品,用于库存管理、多渠道销售分析等;商家可输入erp编码、库存编号、标准条码等*/
		OuterId?: string | null;
		/** 商品状态*/
		Status: FoodStatusType;
		Name: string;
		/** 商品描述*/
		Description: string;
		/** 卖点零售有(在大多数平台中被当成副标题来展示)*/
		SellingPoint?: string | null;
		/** 商品图片，第一张代表主图，其他顺序代表次图*/
		ImageUrls?: FoodImage[] | null;
		/** 商品视频*/
		FoodVideos?: FoodVideo[] | null;
		/** 图片内容 针对零售*/
		PicContent?: FoodImage[] | null;
		/** 商品类目 竞对店铺可能没有*/
		Category?: FoodCategory | null;
		/** 最少起售数量(最少购买多少份) 套餐可能没*/
		MinBuyCount?: number | null;
		/** 最多能买多少*/
		MaxBuyCount?: number | null;
		/** 商品排序*/
		Index: number;
		/** 最顶层的哪个规格组名称*/
		MasterSpec: string;
		/** 表示平台以每个规格选项来定价 目前饿了么和美团都是这种形式*/
		SpecPrice: boolean;
		/** 规格*/
		Specifications?: FoodSpecification[] | null;
		/** 这里应该叫skus 本质上这里应该统一存所有 Specifications 的排列路径
这里本质上存的就是经过排列的选项 批晌具体的库存 价格等*/
		SkuList?: FoodSkuItem[] | null;
		/** 售卖时间范围 只有饿了么支持*/
		SellDayScope?: DateTimeScope | null;
		/** 售卖时间 如果为空就是全时段*/
		SellTime?: FoodSellTimeDay[] | null;
		/** 标签 如店内招牌,单点不送,仅套餐可售卖*/
		FoodLables?: FoodLableItem[] | null;
		/** 套餐搭配- 固定商品*/
		CombineFood?: CombineFoodItem[] | null;
		/** 套餐搭配- 分组可选套餐*/
		CombineGroupFood?: CombineGroupFood[] | null;
		/** 分组套餐自己定义菜品版本(团购商品)*/
		TG_CustomGroupFoods?: TG_CustomGroupFood[] | null;
		/** 自定义套餐内容*/
		CombineCustomFood?: CombineCustomFoodItem[] | null;
		/** 商品类型*/
		FoodType: FoodType;
		/** 其他值,比如饿了么会有 vfoodId 商品id有两个*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** 售后支持*/
		AfterSale?: FoodAfterSaleConf | null;
		/** 品牌 零售可能有*/
		BrandPrty?: PropertySubValueItem | null;
		/** 特殊属性 零售可能有*/
		SpecialAttrs?: ParsePropertiesParms[] | null;
		/** 商品自定义的属性 可以乱输入的*/
		MyProperties?: ParsePropertiesParms[] | null;
		/** 团购-使用规则*/
		TG_UseRule?: TG_UseRuleConf | null;
		UsePeopleNum?: NumScope | null;
}
