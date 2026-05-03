export interface ShopLoginKeyInfo {
		/** 用户id*/
		UserId: string;
		/** 除了Begin,任何操作,都要在这个时间过后关闭登陆任务,避免任务过多*/
		EndTime: Date;
		/** 表示是用哪个host登陆的 不是begin时就用这个来请求*/
		Host: string;
}
