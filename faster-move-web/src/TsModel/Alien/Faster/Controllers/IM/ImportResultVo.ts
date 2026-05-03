/** 导入结果VO（导入分享码话术后返回的结果）*/
export interface ImportResultVo {
		/** 是否导入成功*/
		success: boolean;
		/** 成功导入的话术数量*/
		imported_count: number;
		/** 跳过的话术数量（冲突或错误导致未导入）*/
		skipped_count: number;
		/** 导入结果描述信息*/
		message: string;
}
