import {FoodGroupType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupType";
import {GroupTopConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/GroupTopConf";
import * as Comm from '@/TsModel/Comm/Comm';

/** 菜单分组*/
export interface FoodGroupItem {
		/** t_wmt_fc_fdmv_group.id*/
		id: string;
		/** 平台分组id*/
		OfficeId: string;
		/** 分组code 零售类有*/
		Code?: string | null;
		/** 排序*/
		Index: number;
		/** 分组名称*/
		Name: string;
		/** 分组图片*/
		Icon?: string | null;
		/** 分组描述*/
		Description: string;
		/** 商品个数*/
		FoodCount: number;
		/** 分组类型 0:普通分类 1:必点分类（每个菜单最多只能设置一个）*/
		GroupType: FoodGroupType;
		/** 分组置顶设置*/
		TopConf?: GroupTopConf | null;
		/** 子分组*/
		Children?: FoodGroupItem[] | null;
		/** 其他值*/
		OtherValues?: Comm.Dictionary<string, string> | null;
		/** 这个分组在第几层 从1 开始,由本系统维护*/
		Level: number;
}
