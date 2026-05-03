/** im自动回复设置*/
export interface AutomaticReplyConf {
		/** 自动回复内容*/
		content: string[];
		/** 自动回复条数*/
		sendNum: number;
		/** 等等多少秒*/
		waitSeconds: number;
}
