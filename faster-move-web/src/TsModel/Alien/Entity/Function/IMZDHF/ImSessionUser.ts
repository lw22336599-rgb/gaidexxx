/** 储存会话的用户基本信息*/
export interface ImSessionUser {
		/** 可能是带星号的号码*/
		PhoneNumber?: string | null;
		/** 客户呢称*/
		NikeName?: string | null;
		/** 手机尾号*/
		TailNumber?: string | null;
		/** 用户标签,平台可能返回如: 门店新客,已下N单这种标签*/
		Tags?: string[] | null;
}
