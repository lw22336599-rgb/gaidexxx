/** 饿了么外卖开放平台配置。*/
export interface ElmWaiMaiConfig {
		/** 应用编号。*/
		AppId?: string | null;
		/** 应用 Key。*/
		AppKey?: string | null;
		/** 应用秘钥。*/
		AppSecret?: string | null;
		/** API 调用地址。*/
		ApiUrl?: string | null;
		/** 授权地址。*/
		AuthUrl?: string | null;
		/** 授权回调地址。*/
		RedirectUri?: string | null;
		/** https://open-api-sandbox.shop.ele.me/token*/
		BaseUrl: string;
}
