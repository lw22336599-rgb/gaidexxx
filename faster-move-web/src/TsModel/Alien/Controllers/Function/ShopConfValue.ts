import * as Comm from '@/TsModel/Comm/Comm';

/** 单个店铺的参数值*/
export interface ShopConfValue {
		/** 店铺id*/
		ShopId: string;
		/** 针对该店铺的配置参数，键为参数名，值为参数值*/
		ConfValues?: Comm.Dictionary<string, any> | null;
}
