import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";

/** 更新 Webhook 输入参数*/
export interface UpdateWebhookInput {
		/** 配置ID*/
		Id: string;
		/** Webhook 类型 (4=企业微信, 5=钉钉, 6=飞书)*/
		WebhookType: ChatType;
		/** Webhook URL 地址*/
		WebhookUrl: string;
		/** 备注名称*/
		Remark?: string | null;
}
