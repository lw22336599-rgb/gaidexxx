import {QuickReplyType} from "@/TsModel/Alien/Entity/Enums/IM/QuickReplyType";

/** 话术VO*/
export interface QuickReplyVo {
		/** 话术ID*/
		id: string;
		/** 快捷命令（用于快速输入的简短代码，支持字母或中文）*/
		shortcut: string;
		/** 话术内容（完整的回复文本）*/
		content: string;
		/** 话术类型（1=个人话术，仅创建者可见；2=团队话术，团队成员可见）*/
		type: QuickReplyType;
		/** 分类ID（关联全局分组表）*/
		group?: string | null;
		/** 分类名称*/
		group_name?: string | null;
		/** 排序序号（数字越小越靠前）*/
		sort_order: number;
		/** 是否为当前用户创建的话术（true=自己创建，false=他人创建）*/
		is_owner: boolean;
		/** 创建时间*/
		crtim?: Date | null;
		/** 创建人ID*/
		admin_id?: string | null;
		/** 创建人姓名*/
		admin_name?: string | null;
}
