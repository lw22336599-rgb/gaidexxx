/** 获取用户自己的 Google Authenticator 密钥的响应*/
export interface GetGoogleAuthenticatorSecretRes {
		/** Google Authenticator 密钥（用于在电脑上保存并自动计算验证码）*/
		Secret: string;
		/** 用户名（用于标识该密钥对应的账户）*/
		UserName: string;
}
