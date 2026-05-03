export interface Enable_func_parm {
		/** 功能编码*/
		code: string;
		/** 是否启用*/
		enable: boolean;
		/** 店铺id*/
		shop: string;
		/** 关闭功能时是否同时关闭依赖功能（默认 false）*/
		close_depends: boolean;
}
