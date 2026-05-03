/** 套餐商品*/
export interface CombineFoodItem {
		/** 份数 可能没有*/
		Count?: number | null;
		/** 商品名*/
		FoodName: string;
		/** spu id*/
		SpuId: string;
		/** sku名*/
		SkuName: string;
		/** skuid*/
		SkuId: string;
		/** 表明sku的 层级 比如 小份->重->自定义->规格3的1 美团是按规格排列的。而饿了么不同 只有一层 就是份量*/
		SkuNamePath: string[];
}
