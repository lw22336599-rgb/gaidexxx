export interface FuncEndTimeItem {
		/** 用户功能id*/
		FuncUser: string;
		/** 功能名称*/
		FuncName: string;
		/** 添加了多少天*/
		AddDays: number;
		/** 原来的到期时间*/
		OldEndTime: Date;
		/** 新的到期时间*/
		NewEndTime: Date;
}
