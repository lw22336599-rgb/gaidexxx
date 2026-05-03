import {t_wmt_fc_fdmv_rule} from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_rule";

export interface SyncGroupsParms {
		/** 任务id*/
		taskId: string;
		/** 限定同步哪些分组id(本地数据库的id)*/
		group_ids?: string[] | null;
		/** 追加规则*/
		appendRules?: t_wmt_fc_fdmv_rule[] | null;
}
