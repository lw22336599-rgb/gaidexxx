export interface GetGifListParmsVo {
		page: number;
		pageSize: number;
		/** 分组 如果为空就取全部*/
		groupId?: string | null;
}
