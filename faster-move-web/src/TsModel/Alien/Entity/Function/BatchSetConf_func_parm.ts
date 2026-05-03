/** 批量功能配置更新请求参数*/
export interface BatchSetConf_func_parm {
		/** 平台类型*/
		ShopType: number;
		/** 功能编码：CHATPUSH、ZDCC、IMZDHF 等*/
		Code: string;
		/** 店铺 id 列表*/
		ShopIds: string[];
		/** 各功能配置，CHATPUSH 时需 PushGroupOffIds/PushFriendOffids=null*/
		ConfObj: any;
}
