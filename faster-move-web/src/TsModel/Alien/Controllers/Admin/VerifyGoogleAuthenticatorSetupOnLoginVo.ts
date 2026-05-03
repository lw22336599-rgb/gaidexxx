/** 登录时验证 Google Authenticator 设置的参数*/
export interface VerifyGoogleAuthenticatorSetupOnLoginVo {
		/** 用户名*/
		phone: string;
		/** 密码*/
		pwd: string;
		/** 验证码（6位数字）*/
		Code: string;
}
