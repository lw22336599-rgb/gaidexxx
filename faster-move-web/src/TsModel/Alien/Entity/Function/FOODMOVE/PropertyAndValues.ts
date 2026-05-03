import {t_fdmv_prty} from "@/TsModel/Alien/fdmv/Db/FdmvTables/t_fdmv_prty";
import {OtherPropertyVal} from "@/TsModel/Alien/Entity/Function/FOODMOVE/OtherPropertyVal";

/** 前端传过来的属性*/
export interface PropertyAndValues {
		Prty: t_fdmv_prty;
		/** 值或可选值*/
		Values?: OtherPropertyVal[] | null;
}
