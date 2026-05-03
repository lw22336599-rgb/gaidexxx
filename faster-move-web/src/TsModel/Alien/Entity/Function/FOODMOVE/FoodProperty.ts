import {t_fdmv_prty} from "@/TsModel/Alien/fdmv/Db/FdmvTables/t_fdmv_prty";
import {OtherPropertyVal} from "@/TsModel/Alien/Entity/Function/FOODMOVE/OtherPropertyVal";

/** 商品属性*/
export interface FoodProperty {
		/** 属性树形结构*/
		PropertyTree: Alien.Entity.ModelSingleTree<t_fdmv_prty>;
		/** 会根据值是否可以多值来决定只取一个*/
		Values?: t_fdmv_prty[] | null;
		/** 不在数据库中存在的属性*/
		OtherValues?: OtherPropertyVal[] | null;
}
