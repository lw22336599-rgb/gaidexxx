/** 批量取消分配店铺参数*/
export interface BatchUnassignShopsVo {
		/** 目标用户ID（要从谁那里取消）*/
		UserId: string;
		/** 要取消分配的店铺ID列表*/
		ShopIds: string[];
}
