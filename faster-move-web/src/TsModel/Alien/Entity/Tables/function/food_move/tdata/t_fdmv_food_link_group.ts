/** 此表为了支持商品多分组而定义, 记录每个分组下关联了哪些商品*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_fdmv_food_link_group extends BaseSysExTime, IFdmvTaskEntity {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 所属店铺 竞对店铺可能没有*/
		shop?: string | null;
		/** 如果是竞对店铺,就是由前端指定 如果是老到新就是新店id*/
		shop_offid: string;
		/** 关联的分组 t_wmt_fdmv_group.id*/
		group_id: string;
		/** 分组官方id*/
		group_offid: string;
		/** spuid*/
		spu: string;
		/** 商品id t_wmt_fc_fdmv_food.id*/
		food_id: string;
}
