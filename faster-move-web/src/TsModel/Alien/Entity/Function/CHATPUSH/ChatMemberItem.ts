import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";
import {MemberType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/MemberType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 聊天成员信息（好友或群）*/
export interface ChatMemberItem {
		/** 账号类型（微信、钉钉、飞书等）*/
		ChatType: ChatType;
		/** 成员类型（好友或群）*/
		MemType: MemberType;
		/** 成员昵称/名称*/
		Name: string;
		/** 成员备注（仅好友有备注）*/
		Remark?: string | null;
		/** 头像（可能是图片链接或base64）*/
		HeadImg?: string | null;
		/** 成员的唯一标识（微信ID、钉钉ID等）*/
		Offid: string;
		/** 其他扩展信息*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
