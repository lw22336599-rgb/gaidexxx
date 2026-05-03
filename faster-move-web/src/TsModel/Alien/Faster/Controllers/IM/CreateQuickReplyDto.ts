import {QuickReplyType} from "@/TsModel/Alien/Entity/Enums/IM/QuickReplyType";

/** 创建话术参数*/
export interface CreateQuickReplyDto {
		/** 快捷命令*/
		shortcut: string;
		/** 话术内容*/
		content: string;
		/** 话术类型*/
		type: QuickReplyType;
		/** 分类ID*/
		group?: string | null;
		/** 分类名称*/
		group_name?: string | null;
		/** 排序序号*/
		sort_order?: number | null;
}
