import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 推送账号列表*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_chat_push_list extends BaseSysExTime {
		/** 属性用户*/
		admin: string;
		/** chat类型*/
		chat_type: ChatType;
		/** 服务host(后端最终会与这个host请求)*/
		host: string;
		/** 头像 可能是图片连接 可能是base64图片*/
		head_img: string;
		/** 名称*/
		name: string;
		/** 目前是wxid*/
		offid: string;
		/** 是否在线*/
		on_line: boolean;
		/** 客户端密钥 这是后端请求微信客户端时的唯一凭证*/
		key: string;
		/** 管理员id*/
		MannagerOffIds: string[];
		/** 其他信息*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
