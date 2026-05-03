/** 日志监控配置。*/
export interface ServerConfig {
		/** 请求协议类型。*/
		HttpType?: string | null;
		/** 外网访问地址。*/
		HostPublic?: string | null;
		/** 内网访问地址。*/
		HostPrivate?: string | null;
}
