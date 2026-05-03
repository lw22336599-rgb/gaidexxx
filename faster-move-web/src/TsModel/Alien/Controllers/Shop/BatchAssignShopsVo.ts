/** 批量分配店铺参数*/
export interface BatchAssignShopsVo {
		/** 目标用户ID（要分配给谁）*/
		UserId: string;
		/** 要分配的店铺ID列表*/
		ShopIds: string[];
}
