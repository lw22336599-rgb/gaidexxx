/** 商品sku 项*/
export interface FoodSkuSimpleItem {
		/** 规格名 如份量*/
		SpecName?: string | null;
		/** 所属spu*/
		SpuId: string;
		/** 排列后的路径 如大份->加料-。。。。*/
		NamePath?: string[] | null;
		/** 其实就是 NamePath 的最后一个也就是之前理解的OptName 定位折扣活动时。多个判断条件*/
		SkuName?: string | null;
		/** skuid*/
		SkuId: string;
		/** 选项的价格 可能为空*/
		OptPrice?: number | null;
}
