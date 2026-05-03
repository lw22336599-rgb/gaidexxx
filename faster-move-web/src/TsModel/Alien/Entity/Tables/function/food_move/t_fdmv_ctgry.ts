import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 类目表*/
import {BaseTree} from "@/TsModel/Alien/Entity/Tabls/BaseTree";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface t_fdmv_ctgry extends BaseTree, ITree {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 平台给出的此分类id*/
		off_id: string;
		/** 代表平台更新这个类型的时间 美团没*/
		off_time?: Date | null;
		/** 分类名称*/
		name: string;
		/** true:这个类目有子项 false:没有*/
		has_child: boolean;
		/** 从父级一直到当前级的名称如 a>b>c>d*/
		name_path: string;
		/** 其他值*/
		OhtherValues?: Comm.Dictionary<string, string> | null;
}
