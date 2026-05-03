import {GroupType} from "@/TsModel/Alien/Entity/Enums/GroupType";

/** 代理分组*/
import {BaseTree} from "@/TsModel/Alien/Entity/Tabls/BaseTree";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface t_wmt_group extends BaseTree, ITree {
		/** 分组类型(比如针对店铺分组,针对代理分组等)*/
		type: GroupType;
		/** 分组创建人*/
		user: string;
		/** 分组名称*/
		name: string;
		/** 排序*/
		index?: number | null;
}
