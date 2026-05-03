import {AlipayClientConf} from "@/TsModel/Alien/Entity/AppConf/AlipayClientConf";
import {WeChatPayClientConf} from "@/TsModel/Alien/Entity/AppConf/WeChatPayClientConf";

/** 支付配置集合。*/
export interface PaylinksConfig {
		/** 支付宝配置。*/
		Alipay?: AlipayClientConf | null;
		/** 微信支付配置。*/
		WeChatPay?: WeChatPayClientConf | null;
}
