export interface AgencyRegVo {
		/** 用户名必须是手机号*/
		phone: string;
		/** 邀请码或团队ID*/
		codeOrTeamId: number;
		/** 密码*/
		p: string;
		p1: string;
		/** 是否商家*/
		is_boss: boolean;
}
