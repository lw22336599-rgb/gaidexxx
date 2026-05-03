/** 分享码VO（生成分享码时返回）*/
export interface ShareCodeVo {
		/** 分享码（AES加密的字符串，包含用户ID和过期时间）*/
		share_code: string;
		/** 分享者姓名*/
		admin_name: string;
		/** 话术总数（分享者当前拥有的话术数量）*/
		script_count: number;
		/** 过期时间（null表示永久有效）*/
		expire_time?: Date | null;
}
