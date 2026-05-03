export interface FoodManageParmsBase {
		/** 此操作只针对数据库 操作完后统一更新到平台*/
		SyncSite: boolean;
		/** 限制分组如为空代表所有分组*/
		GroupOffids?: string[] | null;
		/** 任务id*/
		TaskId: string;
}
