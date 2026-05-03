/** 用户关联的门店分组,只要关联了,用户就有权限管理分组下的店铺*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_sc_admin_shop_group extends BaseSys {
		/** 用户*/
		admin: string;
		/** 树结构*/
		groups: string[];
}
