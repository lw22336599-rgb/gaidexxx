/** 启用 Google Authenticator 的响应*/
export interface EnableGoogleAuthenticatorRes {
		/** 二维码 URL（otpauth://totp/...）*/
		QrCodeUrl: string;
		/** 二维码图片（Base64编码）*/
		QrCodeImage: string;
		/** 手动输入密钥（用于无法扫描二维码的情况）*/
		Secret: string;
}
