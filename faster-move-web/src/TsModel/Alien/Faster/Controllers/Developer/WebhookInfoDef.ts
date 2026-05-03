import {WebhookExample} from "@/TsModel/Alien/Faster/Controllers/Developer/WebhookExample";

/** Webhook 信息定义*/
export interface WebhookInfoDef {
		/** 企业微信 Webhook*/
		WechatWebhook: WebhookExample;
		/** 钉钉 Webhook*/
		DingdingWebhook: WebhookExample;
		/** 飞书 Webhook*/
		FeishuWebhook: WebhookExample;
}
