import {ChatInfo} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatInfo";
import {ChatMemberItem} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem";
import {ChatMemberPageRequest} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageRequest";
import {ChatMemberPageResult} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageResult";
import {t_chat_push_list} from "@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list";

/** 实体定义*/
export interface ChatClientEntitiesDef {
		/** 聊天账号信息*/
		ChatInfo: ChatInfo;
		/** 聊天成员信息（好友或群）*/
		ChatMemberItem: ChatMemberItem;
		/** 聊天成员分页请求参数*/
		ChatMemberPageRequest: ChatMemberPageRequest;
		/** 聊天成员分页结果*/
		ChatMemberPageResult: ChatMemberPageResult;
		/** 推送账号列表表结构*/
		ChatPushListTable: t_chat_push_list;
}
