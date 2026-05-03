import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface GetAdminListItemInfoVo extends t_sc_admin, ITree {
		/** 美团数量*/
		mt_count: number;
		/** 饿了么数量*/
		ele_count: number;
		/** 关联的店铺分组id*/
		shop_groups: string;
}
