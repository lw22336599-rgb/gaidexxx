/** 分页结果视图对象*/
export interface PageResultVo <T> {
		/** 当前页码*/
		page: number;
		/** 总记录数*/
		total: number;
		/** 每页大小*/
		pageSize: number;
		rows: PageResultVo`1;
}
