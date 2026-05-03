/** 功能调用结果（用于 Orleans 序列化）
替代匿名类型，避免 Orleans 序列化错误*/
export interface FunctionCallResult {
		/** 是否成功*/
		Success: boolean;
		/** 消息内容*/
		Message?: string | null;
		/** 数据（可选）*/
		Data?: any | null;
}
