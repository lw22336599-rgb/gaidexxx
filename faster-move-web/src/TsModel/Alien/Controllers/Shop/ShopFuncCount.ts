/** 店铺其他信息数量*/
export interface ShopFuncCount {
		/** 功能代码*/
		func_code: string;
		/** 已到期店铺数量*/
		has_end: number;
		/** 即将到期的数量*/
		almost_end: number;
		/** 未到期的数量*/
		not_out: number;
}
