/** 批量操作失败项 */
export interface BatchOperationFailItem {
	/** 店铺ID（内部主键） */
	ShopId: string;
	/** 门店ID（office_id，平台侧门店编号） */
	OffId?: string | null;
	/** 店铺名称 */
	ShopName?: string | null;
	/** 失败原因 */
	Reason: string;
}

/** 批量操作结果 */
export interface BatchOperationResult {
	/** 成功数量 */
	SuccessCount: number;
	/** 失败列表（店铺ID + 失败原因） */
	FailedList: BatchOperationFailItem[];
}
