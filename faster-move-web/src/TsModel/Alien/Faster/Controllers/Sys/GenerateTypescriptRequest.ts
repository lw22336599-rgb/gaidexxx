/** TypeScript生成请求模型*/
export interface GenerateTypescriptRequest {
		/** 输出目录路径*/
		OutputPath: string;
		/** 是否包含axios API类*/
		IncludeAxios: boolean;
		/** 是否包含模型类型*/
		IncludeModels: boolean;
		/** 是否包含枚举类型*/
		IncludeEnums: boolean;
		/** 是否生成统一的 ApiManager.ts 文件
当前端可能会自定义/修改该文件时,可以关闭此开关避免被覆盖*/
		IncludeApiManager: boolean;
}
