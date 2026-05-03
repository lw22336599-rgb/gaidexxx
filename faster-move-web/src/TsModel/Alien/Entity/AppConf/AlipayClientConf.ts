/** 支付宝支付配置*/
export interface AlipayClientConf {
		/** 网关地址*/
		ServerUrl: string;
		/** 应用Id*/
		AppId: string;
		/** 应用私钥(PKCS#1)*/
		AppPrivateKey: string;
		/** 应用证书序列号*/
		AppCertSN?: string | null;
		/** 支付宝公钥*/
		AlipayPublicKey: string;
		/** 支付宝证书序列号*/
		AlipayCertSN?: string | null;
		/** 支付宝根证书序列号*/
		AlipayRootCertSN?: string | null;
		/** 敏感信息对称加密算法类型，推荐：AES*/
		EncryptType?: string | null;
		/** 敏感信息对称加密算法密钥*/
		EncryptKey?: string | null;
		/** 支付成功后通知地址*/
		NotifyUrl: string;
}
