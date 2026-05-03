import {JdOfficeImConf} from "@/TsModel/Alien/Entity/AppConf/JdOfficeImConf";

/** 京东零售开放平台配置。*/
export interface JdOfficeLsConfig {
		/** 应用编号（部分环境使用）。*/
		AppId?: string | null;
		/** 应用 Key（部分环境使用）。*/
		AppKey?: string | null;
		/** 应用秘钥。*/
		AppSecret?: string | null;
		/** 另一个秘钥字段（部分环境使用）。*/
		SecretKey?: string | null;
		/** 授权回调地址。*/
		RedirectUri?: string | null;
		ImConf?: JdOfficeImConf | null;
}
