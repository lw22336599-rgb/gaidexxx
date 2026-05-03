import {JobStatus} from "@/TsModel/Alien/Entity/Enums/JobStatus";

/** 分页查询 t_ls_job_info 任务执行情况的请求参数*/
export interface GetFuncJobInfoPageParm {
		/** 页码，从1开始*/
		page: number;
		/** 每页数量，最大100*/
		pageSize: number;
		/** 功能代码（模糊匹配 task_name，空则不过滤）*/
		func_code?: string | null;
		/** 任务名称（模糊匹配，空则不过滤）*/
		task_name?: string | null;
		/** 任务状态（空则不过滤）*/
		job_status?: JobStatus | null;
}
