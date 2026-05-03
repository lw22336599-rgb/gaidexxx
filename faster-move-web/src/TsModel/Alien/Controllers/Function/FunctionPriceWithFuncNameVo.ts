/** 带有友好功能名称集合的功能价格VO, 继承自 t_wmt_function_price*/
import {t_wmt_function_price} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function_price";
export interface FunctionPriceWithFuncNameVo extends t_wmt_function_price {
		/** multi_func 中功能ID对应的功能名称集合, 方便前端直接展示*/
		func_names: string[];
}
