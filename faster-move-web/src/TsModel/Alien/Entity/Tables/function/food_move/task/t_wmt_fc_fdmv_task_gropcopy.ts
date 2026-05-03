import {BaseTreeExTime} from "@/TsModel/Alien/Entity/Tabls/BaseTreeExTime";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_task_gropcopy extends BaseTreeExTime, ITree, IFdmvTaskEntity {
		/** 任务id*/
		task: string;
		/** 商品在数据库中的id t_wmt_fc_fdmv_group.id*/
		group_id: string;
		/** 老店中的分组官方id*/
		old_offid: string;
		/** 复制成功后。 这里显示新的官方id*/
		new_offid?: string | null;
		/** 复制是否成功*/
		succeed: boolean;
		/** 如果失败的话. 记录的错误信息*/
		err_msg?: string | null;
}
