/** 批量取消分配店铺结果*/
export interface BatchUnassignShopsResult {
		/** 成功取消的店铺数量*/
		SuccessCount: number;
		/** 成功取消的店铺名称列表*/
		SuccessShops: string[];
		/** 目标用户名*/
		TargetUserName: string;
}
