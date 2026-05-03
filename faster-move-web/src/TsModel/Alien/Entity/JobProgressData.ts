import {JobStatus} from "@/TsModel/Alien/Entity/Enums/JobStatus";

/** 任务进度数据（Redis 缓存对象）*/
export interface JobProgressData {
		/** 任务ID*/
		JobId: string;
		/** 当前进度*/
		Progress: number;
		/** 总任务数*/
		Total: number;
		/** 成功数量*/
		OkCount: number;
		/** 失败数量*/
		FailCount: number;
		/** 任务状态*/
		Status: JobStatus;
		/** 最后更新时间*/
		LastUpdateTime?: Date | null;
		/** 任务日志消息列表（不在 Redis Hash 中存储，仅用于返回）*/
		Messages: string[];
}
