export interface FoodMoveConfBase {
		/** 同步库存,如果为false 新店数据库存全部为99999*/
		SyncStock: boolean;
		/** 同步老店的上下架状态 如果为false 哪到到新店的商品将全部为下架状态*/
		SyncOnSale: boolean;
		/** 商品类目用推荐模式*/
		CategoryUseRecomend: boolean;
		/** 属性推荐*/
		attr_recomend?: boolean | null;
		/** 属性推荐最小相似度*/
		attr_recomend_s?: number | null;
		/** 是否智能去水印*/
		RemoveWaterMark: boolean;
		/** 其他设置.非通用 如平台的*/
		OtherConf?: string | null;
}
