import {FoodMoveConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConf";

/** 创建托管搬家任务的参数对象*/
export interface CreateFdmvTasJobkVo {
		/** 任务id*/
		TaskId?: string | null;
		/** 搬家设置 兼容老*/
		Conf?: FoodMoveConf | null;
		/** 表示复制这些分组下的商品 t_wmt_fc_fdmv_group.id*/
		GroupIds?: string[] | null;
		/** 商品复制完后重置顺序*/
		IndexSet: boolean;
}
