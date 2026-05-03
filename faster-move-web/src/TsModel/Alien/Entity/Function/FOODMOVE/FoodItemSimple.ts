import {FoodStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodStatusType";
import {FoodImage} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodImage";
import {FoodCategory} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodCategory";
import {FoodType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 除了商品详情信息以为提供最简单的信息描述一个商品*/
export interface FoodItemSimple {
		/** 官方平台的商品id 也就是spuid*/
		SpuId: string;
		/** 商品状态*/
		Status: FoodStatusType;
		Name: string;
		/** 商品图片，第一张代表主图，其他顺序代表次图*/
		ImageUrls?: FoodImage[] | null;
		/** 商品类目 竞对店铺可能没有*/
		Category?: FoodCategory | null;
		/** 商品排序*/
		Index: number;
		/** 商品类型*/
		FoodType: FoodType;
		/** 此商品的分类官方id*/
		GroupOffId: string;
		/** 存放其他信息. 比如饿了么在vfoodid*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** skuids*/
		SkuOffIds: string[];
}
