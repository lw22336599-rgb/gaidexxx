/** 批量分配店铺结果*/
export interface BatchAssignShopsResult {
		/** 成功分配的店铺数量*/
		SuccessCount: number;
		/** 成功分配的店铺名称列表*/
		SuccessShops: string[];
		/** 目标用户名*/
		TargetUserName: string;
}
