/** Orleans 客户端或 Silo 配置。*/
export interface OrleansConfig {
		/** 是否启用 Orleans 客户端。*/
		Enabled?: boolean | null;
		/** 集群标识。*/
		ClusterId?: string | null;
		/** 服务标识。*/
		ServiceId?: string | null;
		/** 静态Gateway地址（用于客户端在K8s外部时）。
格式：IP:Port，如 "123.456.789.10:30001"
如果设置此项，将不使用Redis集群发现，直接连接此Gateway。*/
		StaticGateway?: string | null;
		/** Silo 监听端口。*/
		SiloPort?: number | null;
		/** 网关端口。*/
		GatewayPort?: number | null;
		/** 仪表盘端口。*/
		DashboardPort?: number | null;
		/** 单个Silo节点最多运行的Grain实例数。
当达到此数量时，K8s可以通过指标端点判断需要扩容Silo节点。
可通过环境变量 MAX_GRAIN_INSTANCES_PER_SILO 设置。*/
		MaxGrainInstancesPerSilo?: number | null;
}
