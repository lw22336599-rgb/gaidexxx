/** 存放一些临时变量 避免占内存*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fd_fdmv_task_temp extends BaseSysExTime, IFdmvTaskEntity {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 变量名*/
		key: string;
		/** 变量值*/
		val: string;
}
