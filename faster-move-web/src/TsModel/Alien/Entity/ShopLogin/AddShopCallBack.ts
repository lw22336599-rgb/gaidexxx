import * as Comm from '@/TsModel/Comm/Comm';

/** 配置添加店铺或修复成功的回调协议*/
export interface AddShopCallBack {
		callback_url: string;
		/** 回调时回传给第三方的参数 会以 post form-data 参数方式回调 并且会会把 shop_id(门店id) cookie(商户ck) id(表id) 加进去,*/
		callback_parms: Comm.Dictionary<string, string>;
}
