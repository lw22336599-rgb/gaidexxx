/** 更新话术参数*/
export interface UpdateQuickReplyDto {
		/** 话术ID*/
		id: string;
		/** 快捷命令*/
		shortcut?: string | null;
		/** 话术内容*/
		content?: string | null;
		/** 分类ID*/
		group?: string | null;
		/** 分类名称*/
		group_name?: string | null;
		/** 排序序号*/
		sort_order?: number | null;
}
