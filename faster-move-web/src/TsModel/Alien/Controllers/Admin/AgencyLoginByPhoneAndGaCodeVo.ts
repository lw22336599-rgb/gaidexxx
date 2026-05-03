/** 通过手机号和谷歌验证码登录的参数*/
export interface AgencyLoginByPhoneAndGaCodeVo {
		/** 手机号*/
		phone: string;
		/** Google Authenticator 验证码（6位数字）*/
		ga_code: string;
}
