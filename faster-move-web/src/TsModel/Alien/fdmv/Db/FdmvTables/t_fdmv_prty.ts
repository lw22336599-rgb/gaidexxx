import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {CharacterType} from "@/TsModel/Alien/fdmv/Db/FdmvTables/CharacterType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 商品属性表*/
import {BaseTree} from "@/TsModel/Alien/Entity/Tabls/BaseTree";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface t_fdmv_prty extends BaseTree, ITree {
		/** 店铺类型*/
		shop_type: ShopType;
		/** 平台绑住出此属性的id*/
		off_id: string;
		/** 属性名称*/
		name: string;
		/** 是否可多选(针对有子项的属性)*/
		multi_select?: boolean | null;
		/** 多选情况下,最多能选择多少个值*/
		multi_max?: number | null;
		/** 是否必填(针对有子项的属性)*/
		required?: boolean | null;
		/** 未知 饿了么返回 先保留 (针对有子项的属性)*/
		decision_property?: boolean | null;
		/** 表示这个属性需要查相关关键词决定*/
		need_query?: boolean | null;
		/** 是否有子项*/
		has_child: boolean;
		/** 从父级一直到当前级的名称如 a>b>c>d*/
		name_path: string;
		/** 支持字符类型*/
		CharTypes?: CharacterType[] | null;
		/** 如果是自由输入的话。最大长度是多少*/
		max_length?: number | null;
		/** 是否支持自定义输入*/
		free_val?: boolean | null;
		/** 如果为true 代表 针对此上级是默认值*/
		def_val?: boolean | null;
		/** 其他值类型*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
