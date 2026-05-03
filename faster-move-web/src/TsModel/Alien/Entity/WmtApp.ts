import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";
import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";

export interface WmtApp {
		/** 为了不影响内存占用, 全局存放值的本地数据库*/
		Admin: System.Lazy<t_sc_admin>;
		/** 团购没分组时. 默认的分组对像*/
		DefGroup: FoodGroupItem;
}
