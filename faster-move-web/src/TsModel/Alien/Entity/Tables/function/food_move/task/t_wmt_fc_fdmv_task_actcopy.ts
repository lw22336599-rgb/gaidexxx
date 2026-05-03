import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";

/** 活动复制任务*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_task_actcopy extends BaseSysExTime, IFdmvTaskEntity {
		/** 任务id*/
		task: string;
		/** 商品在数据库中的id t_wmt_fc_fdmv_act.id*/
		act_id: string;
		/** 活动类型*/
		act_type: ActivityType;
		/** 老店中的活动官方id*/
		old_offid: string;
		/** 复制是否成功*/
		succeed: boolean;
		/** 如果失败的话. 记录的错误信息*/
		err_msg?: string | null;
}
