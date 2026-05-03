import {ChatType} from "@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType";

/** 用户 Webhook 配置表
用于免费的店铺掉线通知推送*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_admin_webhook_config extends BaseSys {
		/** 用户ID(关联 t_sc_admin.id)*/
		admin_id: string;
		/** Webhook 类型
4=企业微信, 5=钉钉, 6=飞书*/
		webhook_type: ChatType;
		/** Webhook URL 地址*/
		webhook_url: string;
		/** 备注名称*/
		remark?: string | null;
		/** 是否启用*/
		enabled: boolean;
}
