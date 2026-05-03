/** 批量功能开关请求参数*/
export interface BatchEnable_func_parm {
		/** 平台类型*/
		ShopType: number;
		/** 功能编码：CHATPUSH、ZDCC、IMZDHF 等*/
		Code: string;
		/** 店铺 id 列表*/
		ShopIds: string[];
		/** true=开启, false=关闭*/
		Enable: boolean;
		/** 关闭功能时是否同时关闭依赖功能（默认 false）*/
		CloseDepends: boolean;
}
