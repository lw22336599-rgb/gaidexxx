import * as Comm from '@/TsModel/Comm/Comm';

export interface Update_Shop_parm {
		/** 店铺对像的id*/
		id: string;
		/** 要更新的字段和值*/
		UpdateVal: Comm.Dictionary<string, any>;
}
