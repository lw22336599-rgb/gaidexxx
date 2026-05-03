/** 团队相关信息*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_team_info extends BaseSys {
		admin: string;
		/** 团队logo*/
		logo?: string | null;
		/** 团队名称*/
		team_name?: string | null;
		/** 团队代码*/
		team_code: number;
		/** 联系总部*/
		contact_main?: string | null;
		/** 联系客服*/
		contact_server?: string | null;
		/** 联系运营*/
		onteact_sell?: string | null;
}
