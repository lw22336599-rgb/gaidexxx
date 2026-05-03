import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_im_user_conf extends BaseSys {
		/** t_sc_admin.id*/
		admin: string;
		/** 禁止下级自主成为客服,如果为 true 哪么下级如果没有客服角色是无法开启IM服务的,如果为false 下级打开客服开关就能自动成为客服*/
		no_auto_kefu: boolean;
}
