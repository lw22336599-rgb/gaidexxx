/** 阿里云 DashVector 配置。*/
export interface AliyunDashVectorConfig {
		/** API 密钥。*/
		ApiKey?: string | null;
		/** 服务端点。*/
		Endpoint?: string | null;
		/** 默认集合名称。*/
		DefaultCollection?: string | null;
		/** 请求超时时间（秒）。*/
		TimeoutSeconds?: number | null;
}
