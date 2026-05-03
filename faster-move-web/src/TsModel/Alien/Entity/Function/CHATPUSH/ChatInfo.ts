import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 聊天账号信息*/
export interface ChatInfo {
		/** 账号类型（微信、钉钉、飞书等）*/
		ChatType: ChatType;
		/** 账号昵称/名称*/
		Name: string;
		/** 头像（可能是图片链接或base64）*/
		HeadImg?: string | null;
		/** 账号的唯一标识（微信ID、钉钉ID等）*/
		OffId: string;
		/** 其他扩展信息（如手机号等）*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
