/** 微信支付配置*/
export interface WeChatPayClientConf {
		/** 网关地址*/
		ServerUrl: string;
		/** 应用Id*/
		AppId: string;
		/** 商户号*/
		MchId: string;
		/** 商户证书序列号*/
		MchSerialNo: string;
		/** 商户证书私钥(PKCS#1)*/
		MchPrivateKey: string;
		/** 微信支付公钥*/
		WeChatPayPublicKey?: string | null;
		/** 微信支付公钥Id*/
		WeChatPayPublicKeyId?: string | null;
		/** 商户APIv3密钥 用于解密支付成功回调数据*/
		APIv3Key: string;
		/** 支付成功后通知地址*/
		NotifyUrl: string;
}
