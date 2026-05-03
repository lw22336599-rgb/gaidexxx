export interface ParseWxDataParms {
		taskId: string;
		/** url*/
		url: string;
		/** 向应体*/
		html_body: any;
		/** post 数据.如果有*/
		post?: string | null;
}
