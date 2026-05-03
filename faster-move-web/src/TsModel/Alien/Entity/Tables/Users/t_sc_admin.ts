import {UserType} from "@/TsModel/Alien/Entity/Enums/UserType";

import {BaseSysGroupTree} from "@/TsModel/Alien/Entity/Tabls/BaseSysGroupTree";
import {ITree} from "@/TsModel/Alien/Entity/Interfaces/ITree";
export interface t_sc_admin extends BaseSysGroupTree, ITree {
		user_name: string;
		password: string;
		phone?: string | null;
		/** 权限 也代表了他们的权限*/
		role: string[];
		/** 余额 分配余额功能应单独出来*/
		balance: number;
		login_ip?: string | null;
		login_time: Date;
		/** 邀请码*/
		code: number;
		/** 团队id*/
		team_id: number;
		user_type: UserType;
		/** 登陆错误次数*/
		err_count: number;
		/** Google Authenticator 密钥（Base32编码）*/
		ga_secret?: string | null;
		/** 是否启用 Google Authenticator*/
		ga_enabled?: boolean | null;
}
