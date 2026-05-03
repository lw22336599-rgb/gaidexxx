import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";

/** 店铺商品分组(支持父级)*/
import {BaseTreeExTime} from "@/TsModel/Alien/Entity/Tabls/BaseTreeExTime";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_group extends BaseTreeExTime, ITree, IFdmvTaskEntity {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 所属店铺 竞对店铺可能没有*/
		shop?: string | null;
		/** 如果是竞对店铺,就是由前端指定 如果是老到新就是新店id*/
		shop_offid: string;
		/** 分类官方id*/
		office_id: string;
		/** 分组对像*/
		Group: FoodGroupItem;
		/** （真实在数据库中的-商品数量*/
		spu_count: number;
		/** 上级官方id*/
		ParentOffId?: string | null;
}
