import * as Comm from '@/TsModel/Comm/Comm';

/** 由服务端发出*/
export interface Parm <T> {
		/** 不同的 PoolParmType 类型会产生不同的data 对像*/
		Data?: T | null;
		/** 店铺代理 如果有就会自动设置没有就不会设置*/
		ShopProxy?: Comm.Dictionary<string, string> | null;
}
