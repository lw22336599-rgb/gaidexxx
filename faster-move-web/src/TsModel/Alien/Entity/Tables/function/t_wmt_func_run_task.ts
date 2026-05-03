import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {FuncRunTaskStatus} from "@/TsModel/Alien/Entity/Enums/FuncRunTaskStatus";

/** 功能续费自动执行任务表，2天后自动过期清理*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_func_run_task extends BaseSysExTime {
		/** 用户ID(关联 t_sc_admin.id)*/
		admin_id: string;
		/** 关联功能项表的 id*/
		func_id?: string | null;
		/** 关联功能项表的 code*/
		func_code: string;
		/** 功能项名称（冗余，避免联表）*/
		func_name?: string | null;
		/** 门店 id（饿了么等平台的门店级别 id，可空）*/
		off_id?: string | null;
		/** 店铺 id*/
		shop_id: string;
		/** 店铺名称（冗余，避免联表）*/
		shop_name?: string | null;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 针对该店铺的参数值，JSON 字符串*/
		conf_json?: string | null;
		/** 任务状态*/
		run_status: FuncRunTaskStatus;
		/** 执行结果信息（成功或失败原因）*/
		msg?: string | null;
		/** 执行开始时间*/
		start_time?: Date | null;
		/** 执行结束时间*/
		end_time?: Date | null;
		/** Hangfire 任务ID 或 t_ls_job_info 的 job_id*/
		job_id?: string | null;
		/** 批次ID：同一次触发（续费或手动触发）创建的记录共享同一 batch_id，
用于 AutoRunFuncTask 精确过滤出属于自己的记录，避免跨批次干扰*/
		batch_id?: string | null;
}
