/** 老板要求客户关做的回应*/
export interface BossRespond {
		/** 如果为true 代表当前客户端被炒了,需要退出*/
		OutClient: boolean;
		/** 老板要求客户端增加这些店铺任务*/
		AddShopJobs?: string[] | null;
		/** 老板要求客户端退出这些工作任务*/
		OutJobs?: string[] | null;
		/** 老板要求更新这些店铺任务（此时客户端要更新这些店铺的配置。店铺ck,所有的。。 功能开关等）*/
		UpdateJobs?: string[] | null;
}
