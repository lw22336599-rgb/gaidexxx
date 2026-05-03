export interface ChatItem {
		/** 推送账号 t_chat_push_list.id*/
		ChatOffId: string;
		/** 账号内的成员 如果 t_chat_push_list 是webhook 类型。哪就无值*/
		MemberOffid?: string | null;
}
