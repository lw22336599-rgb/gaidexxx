/** Redis 配置。*/
export interface RedisConfig {
		/** 公网host*/
		HostPublic: string;
		/** 内网host 优先使用*/
		HostPrivate: string;
		/** 用户名*/
		User?: string | null;
		/** 密码*/
		Pwd?: string | null;
		/** 端口*/
		Port: number;
}
