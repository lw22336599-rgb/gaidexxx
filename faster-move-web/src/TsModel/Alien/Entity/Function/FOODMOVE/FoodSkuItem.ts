import {FoodSellStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSellStatusType";
import {UintType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/UintType";
import {FoodImage} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodImage";
import * as Comm from '@/TsModel/Comm/Comm';
import {FoodSkuItemForSpecification} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSkuItemForSpecification";
import {ActivityType_ZheKou} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_ZheKou";

/** 库存和打包费*/
export interface FoodSkuItem {
		/** 由本系统为此sku创建的id*/
		id: string;
		/** sku价格. 餐饮可能没有*/
		Price: number;
		/** 序号(从0开始)*/
		Sequence: number;
		/** 打包费*/
		BoxPrice: number;
		/** 剩余库存 -1 无限库存*/
		Stock: number;
		/** 限制每日总库存*/
		DayStock?: number | null;
		/** 最大库存 -1 无限库存*/
		MaxStock: number;
		/** 自动补足*/
		AutoRefresh: boolean;
		/** 状态*/
		Status: FoodSellStatusType;
		/** 每多少个 Stock 用一个包装( 每多少份 )*/
		BoxNum: number;
		/** sku 如 大份,加料.. 只做为比对用 默认是以逗号连接的*/
		SkuPath: string;
		/** sku id 其实在 ForSpec 中的所有skuid 都是一样的*/
		SkuId: string;
		/** 商家系统中自己定义的ID，常用于openAPI开放平台*/
		OuterId?: string | null;
		/** 重量值*/
		Weight: number;
		/** 重量单位*/
		WeightType: UintType;
		/** 条形码*/
		Barcode?: string | null;
		/** 货架码/位置 一般由商家自定义*/
		ShelfNum?: string | null;
		/** sku图片.如果为空将使用 FoodItem.Images*/
		SkuImages?: FoodImage[] | null;
		/** sku的其他值*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** 起购数, 针对sku*/
		MinBuy?: number | null;
		/** 针对的规格名和属性等 附值时注意排序：第一层一直往最后一层*/
		ForSpec: FoodSkuItemForSpecification[];
		/** 目前用于批量管理商品时.附值折扣活动*/
		Discount?: ActivityType_ZheKou | null;
}
