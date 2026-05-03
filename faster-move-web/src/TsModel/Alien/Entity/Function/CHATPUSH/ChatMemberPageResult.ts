import {ChatMemberItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem";

/** 聊天成员列表分页结果*/
export interface ChatMemberPageResult {
		/** 总记录数*/
		Total: number;
		/** 当前页码*/
		PageIndex: number;
		/** 每页数量*/
		PageSize: number;
		/** 总页数*/
		TotalPages: number;
		/** 成员列表数据*/
		Items: ChatMemberItem[];
}
