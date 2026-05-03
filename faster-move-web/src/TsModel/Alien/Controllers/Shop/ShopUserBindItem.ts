export interface ShopUserBindItem {
		/** 用户id*/
		id: string;
		/** 用户名*/
		user_name: string;
		/** 用户代码(邀请码)*/
		user_code: number;
		/** 绑定时间*/
		bind_time?: Date | null;
		/** 备注*/
		notes: string;
		/** 角色列表*/
		Roles: string[];
}
