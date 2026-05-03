/** 单个功能的 ConfSchema 查询结果*/
export interface FuncConfSchemaResult {
		/** 功能代码*/
		FuncCode: string;
		/** 配置项 JSON Schema，前端据此生成参数输入表单*/
		ConfSchema: string;
		/** 续费后是否自动执行*/
		AutoRenewRun: boolean;
}
