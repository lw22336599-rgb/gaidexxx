/** 让表支持分组*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface BaseSysGroup extends BaseSys {
		/** 分组id*/
		group?: string | null;
		/** 分组名称（避免联表过多）*/
		group_name?: string | null;
}
