/** RabbitMQ 配置类*/
export interface RabbitMQConfig {
		/** 主机名 HostPublic*/
		HostPublic: string;
		/** 内网地址*/
		HostPrivate: string;
		/** 端口号*/
		Port: number;
		/** 用户名*/
		UserName: string;
		/** 密码*/
		Password: string;
		/** 虚拟主机*/
		VirtualHost: string;
		/** 连接超时时间（毫秒）*/
		RequestedConnectionTimeout: number;
		/** 心跳间隔（秒）*/
		RequestedHeartbeat: number;
}
