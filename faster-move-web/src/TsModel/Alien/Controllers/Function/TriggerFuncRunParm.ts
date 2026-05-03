import * as Comm from '@/TsModel/Comm/Comm';
import {ShopConfValue} from "@/TsModel/Alien/Controllers/Function/ShopConfValue";

/** 手动触发功能执行的请求参数*/
export interface TriggerFuncRunParm {
		/** 功能代码*/
		func_code: string;
		/** 要触发的店铺id列表*/
		shop_ids: string[];
		/** 全局默认配置参数（没有单独设置的店铺使用此参数）*/
		default_conf_values?: Comm.Dictionary<string, any> | null;
		/** 各店铺单独的配置参数*/
		shop_conf_values?: ShopConfValue[] | null;
}
