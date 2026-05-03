	/** 任务状态枚举*/
	export enum JobStatus {
		Pending = 0,
		Enqueued = 1,
		Processing = 2,
		Succeeded = 3,
		Scheduled = 4,
		Deleted = -2,
		Failed = -1,
	}
