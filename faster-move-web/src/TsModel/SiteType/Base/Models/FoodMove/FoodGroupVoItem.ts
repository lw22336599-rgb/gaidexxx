
import {t_wmt_fc_fdmv_group} from "@/TsModel/Alien/Entity/Tables/function/food_move/tdata/t_wmt_fc_fdmv_group";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface FoodGroupVoItem extends t_wmt_fc_fdmv_group, ITree, IFdmvTaskEntity {
		/** 子分组*/
		Children: FoodGroupVoItem[];
}
