import {QuickReplyType} from "@/TsModel/Alien/Entity/Enums/IM/QuickReplyType";

/** IM快捷话术表*/
import {BaseSysGroup} from "@/TsModel/Alien/Entity/Tabls/BaseSysGroup";
export interface t_wmt_im_quick_reply extends BaseSysGroup {
		/** 快捷命令（支持字母或中文，1-50字符）*/
		shortcut: string;
		/** 话术内容*/
		content: string;
		/** 话术类型（个人/团队）*/
		type: QuickReplyType;
		/** 排序序号（数字越小越靠前）*/
		sort_order: number;
		/** 创建者ID（关联 t_sc_admin.id）*/
		admin_id: string;
		/** 创建者的上级ID（用于团队话术的可见性判断）*/
		parent_id?: string | null;
}
