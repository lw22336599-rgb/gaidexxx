import * as Comm from '@/TsModel/Comm/Comm';
import {ShopConfValue} from "@/TsModel/Alien/Controllers/Function/ShopConfValue";

/** 批量续费请求参数*/
export interface BatchPayShopV2_Parm {
		/** 要续费的店铺id列表（最多100个）*/
		shops: string[];
		/** 功能项价格id t_wmt_function_price.id*/
		func_price: string;
		/** 续费完成后是否自动执行相关功能*/
		AutoRunAfterPay: boolean;
		/** 全局默认参数值，对没有单独设置参数的店铺生效，JSON对象格式*/
		DefaultConfValues?: Comm.Dictionary<string, any> | null;
		/** 针对各店铺的单独参数值列表*/
		ShopConfValues?: ShopConfValue[] | null;
}
