/** 店铺其他信息数量*/
export interface ShopExtraCount {
		/** 已到期店铺数量*/
		has_end: number;
		/** 授权失效的店铺数量*/
		has_out: number;
		/** 即将到期的数量*/
		almost_end: number;
		/** 没有到期的数量*/
		not_out: number;
}
