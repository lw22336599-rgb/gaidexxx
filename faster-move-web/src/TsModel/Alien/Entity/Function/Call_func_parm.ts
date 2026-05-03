/** 通过 GetUserFunc 校验后调用功能 Call 时的参数（无需传 shop_type）*/
export interface Call_func_parm {
		/** 店铺id*/
		shop: string;
		/** 功能编码*/
		code: string;
		/** 要调用的方法名*/
		method: string;
		/** 方法参数 JSON，可选*/
		parm_obj?: any | null;
}
