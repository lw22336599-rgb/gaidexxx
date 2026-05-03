export interface AgencyLoginVo {
		/** 用户名*/
		phone: string;
		/** 密码*/
		pwd: string;
		/** 老用户没设置手机号时重新提交手机号(第一次会自动保存然后发送验证码)*/
		bind_phone?: string | null;
		/** 老用户重新提交手机号后提交的验证码*/
		bind_phone_code?: string | null;
		/** Google Authenticator 验证码（6位数字）*/
		ga_code?: string | null;
}
