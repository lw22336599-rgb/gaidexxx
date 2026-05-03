/** 所有表都应继承的 id创建时间，更新时间，可用状态，备注等*/
export interface BaseSys {
		/** 主键Id*/
		id: string;
		/** 创建时间*/
		crtim?: Date | null;
		/** 更新时间*/
		uptim?: Date | null;
		/** 是否可用，1可用，0不可用*/
		avtag: boolean;
		notes: string;
}
