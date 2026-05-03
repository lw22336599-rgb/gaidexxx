import {FoodSellStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSellStatusType";
import {UintType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/UintType";
import * as Comm from '@/TsModel/Comm/Comm';
import {FoodSkuItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuItem";

export interface FoodSpecificationOption {
		/** 规格选项id 注意这是自己生成的,主要是为了让sku 中的id能对应上,注意.有的网站可能会重复.这个最好用spec id 一起拼接,如美团抖音出来可能就是123_3456*/
		id: string;
		/** 规格组名*/
		SpecName: string;
		/** 价格*/
		Price: number;
		/** 选项名称*/
		Name: string;
		/** 销售状态 这应该抽出来。 选项应只记录名称 和一些加料 sku为组合式*/
		Status: FoodSellStatusType;
		/** 计量值*/
		Weight: number;
		/** 计量单位 美团的规格选项中是没有单位的*/
		WeightType?: UintType | null;
		/** 每一个选项都有一个skuid的 sku id是不应该出现在这里的. 在美团中是根据份量向下排 在最底层 应所有都在最低层*/
		SkuId: string;
		/** 顺序 从0开始*/
		Index: number;
		/** 其他信息 比如饿了么可能还会储存其他id*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** 库存与打包费等*/
		SkuInfo?: FoodSkuItem | null;
		/** 针对规格选项的最小购买数*/
		MinBuy?: number | null;
		/** upc 条形码*/
		UpcCode?: string | null;
}
