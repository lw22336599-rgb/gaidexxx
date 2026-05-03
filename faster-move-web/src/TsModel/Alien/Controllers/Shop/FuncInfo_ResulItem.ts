export interface FuncInfo_ResulItem {
		/** t_wmt_function_shop.id*/
		id: string;
		/** 功能启用*/
		enable: boolean;
		/** 功能 ID t_wmt_function.id*/
		function: string;
		/** 功能标识*/
		function_code: string;
		/** 功能名称*/
		function_name: string;
		/** 功能说明*/
		function_desc: string;
		/** 功能使用结束时间*/
		end_time: Date;
}
