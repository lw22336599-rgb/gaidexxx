/** 评价申诉配置*/
export interface EvaluationAppealConf {
		/** 是否申诉中评*/
		appeal_zp: boolean;
		/** 是否申诉差评*/
		appeal_cp: boolean;
		/** 申诉开始：评价后第几天（1-7）*/
		appeal_start_day: number;
		/** 申诉开始时间 HH:mm*/
		appeal_start_time: string;
}
