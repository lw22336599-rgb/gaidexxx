import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";

/** 商品复制任务列表*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_task_fdcopy extends BaseSysExTime, IFdmvTaskEntity {
		/** 任务id*/
		task: string;
		/** 同一次复制使用相同的id,下次复制会变.用于去除当次复制过的*/
		event_id?: string | null;
		/** 商品在数据库中的id t_wmt_fc_fdmv_food.id*/
		food_id: string;
		/** 老店中的商品spuid*/
		old_spu: string;
		/** 复制成功后。 这里显示新的spuid*/
		new_spu?: string | null;
		/** 复制是否成功*/
		succeed: boolean;
		err_msg?: string | null;
		/** 复制成功后记录真正上传成功到新店的商品对像,也是记录了MapToNewShopFood 之后的结果 注意! 新版本如果不为null 会直接当成新店商品不用去映射直接用这个上传*/
		NewFood?: FoodItem | null;
		/** 表示已经尝试复制的次数*/
		try_count: number;
}
