/** RESTful风格---XIAONUO返回格式*/
export interface RestResult <T> {
		/** 执行成功*/
		Success: boolean;
		/** 状态码*/
		code?: number | null;
		/** 错误信息*/
		message: any;
		/** 数据*/
		data?: T | null;
		/** 附加数据*/
		Extras: any;
		/** 时间戳*/
		Timestamp: number;
}
