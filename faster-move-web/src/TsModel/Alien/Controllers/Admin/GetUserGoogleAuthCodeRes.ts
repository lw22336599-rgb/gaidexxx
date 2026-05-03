/** 获取指定用户令牌验证码的响应*/
export interface GetUserGoogleAuthCodeRes {
		/** 当前6位验证码*/
		Code: string;
		/** 用户名*/
		UserName: string;
		/** 用户ID*/
		UserId: string;
}
