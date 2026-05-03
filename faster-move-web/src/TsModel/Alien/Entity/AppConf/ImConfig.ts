/** IM/客服系统配置类*/
export interface ImConfig {
		/** 默认响应超时分钟数*/
		DefaultResponseTimeoutMinutes: number;
		/** 在线判断阈值分钟数（最后活跃时间在此时间内视为在线）*/
		OnlineThresholdMinutes: number;
		/** 标签最大长度（字符数）*/
		MaxTagLength: number;
		/** 每个会话最大标签数*/
		MaxTagsPerSession: number;
		/** 自动分配任务执行间隔（秒）*/
		AutoAssignIntervalSeconds: number;
		/** 标签允许的字符模式（正则表达式）
默认只允许中文、英文、数字*/
		TagAllowedPattern: string;
}
