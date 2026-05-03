/** 月度数据针对成员的结构*/
export interface MemberDataMonthClass {
		/** 用户id*/
		admin: string;
		/** 排名*/
		top: number;
		/** 成员名称*/
		user_name: string;
		/** 成员id*/
		member_id: number;
		/** 当月统计*/
		last_month_count: number;
		/** 统计统计*/
		total: number;
}
