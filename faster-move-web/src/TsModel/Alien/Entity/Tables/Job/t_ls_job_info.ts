import {JobStatus} from "@/TsModel/Alien/Entity/Enums/JobStatus";

/** 任务关联信息表 - 用于记录任务与店群的静态关联关系
避免全表扫描Hangfire数据库，提高查询效率
只记录静态信息，动态状态信息通过Hangfire API获取*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_ls_job_info extends BaseSys {
		/** Hangfire任务ID*/
		job_id: string;
		/** 创建用户ID*/
		user_id?: string | null;
		/** 任务名称*/
		task_name: string;
		/** 任务编码= 也就是自定义任务id了,默认是此表的id*/
		task_code?: string | null;
		/** 任务类型 目前是记录任务类的类名*/
		task_type: string;
		/** 任务备注（静态信息，不会随任务状态变化）*/
		remark?: string | null;
		/** 父任务ID（用于子任务关联）*/
		parent_job_id?: string | null;
		/** 任务优先级（数字越小优先级越高）*/
		priority: number;
		/** 队列名称（用于分布式部署，不同服务器处理不同队列）*/
		queue_name: string;
		/** 是否已删除*/
		is_deleted: boolean;
		/** t_wmt_fc_fdmv_task.id 可能没有*/
		task_id?: string | null;
		/** 任务状态*/
		job_status: JobStatus;
		/** 当前进度*/
		progress: number;
		/** 总任务数*/
		total: number;
		/** 进度百分比*/
		curr_percent?: number | null;
		/** 成功数量*/
		success_count?: number | null;
		/** 失败数量*/
		fail_count?: number | null;
		/** 最后更新时间*/
		last_update_time?: Date | null;
		/** 错误信息*/
		error_message?: string | null;
}
