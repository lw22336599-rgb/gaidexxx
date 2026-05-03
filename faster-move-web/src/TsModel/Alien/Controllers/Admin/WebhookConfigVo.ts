import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";

/** Webhook 配置视图对象*/
export interface WebhookConfigVo {
		/** 配置ID*/
		Id: string;
		/** Webhook 类型*/
		WebhookType: ChatType;
		/** Webhook 类型名称*/
		WebhookTypeName: string;
		/** Webhook URL*/
		WebhookUrl: string;
		/** 备注*/
		Remark?: string | null;
		/** 是否启用*/
		Enabled: boolean;
		/** 创建时间*/
		AddTime?: Date | null;
		/** 更新时间*/
		UpdateTime?: Date | null;
}
