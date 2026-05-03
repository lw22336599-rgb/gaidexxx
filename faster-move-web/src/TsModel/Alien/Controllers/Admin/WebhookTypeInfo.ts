import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";

/** Webhook 类型信息*/
export interface WebhookTypeInfo {
		/** Webhook 类型*/
		Type: ChatType;
		/** 类型名称*/
		Name: string;
		/** 描述*/
		Description: string;
		/** 帮助文档链接*/
		HelpUrl: string;
}
