import {t_wmt_fc_fdmv_food} from "@/TsModel/Alien/Entity/Tables/function/food_move/tdata/t_wmt_fc_fdmv_food";
import {t_wmt_fc_fdmv_task_fdcopy} from "@/TsModel/Alien/Entity/Tables/function/food_move/task/t_wmt_fc_fdmv_task_fdcopy";

export interface PartDb_FoodWithTask {
		FoodDb: t_wmt_fc_fdmv_food;
		TaskDb: t_wmt_fc_fdmv_task_fdcopy;
}
