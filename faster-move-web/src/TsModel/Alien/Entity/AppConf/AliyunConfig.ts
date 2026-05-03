import {AliyunDashVectorConfig} from "@/TsModel/Alien/Entity/AppConf/AliyunDashVectorConfig";
import {AliyunBailianConfig} from "@/TsModel/Alien/Entity/AppConf/AliyunBailianConfig";
import {AliyunSlsConf} from "@/TsModel/Alien/Entity/AppConf/AliyunSlsConf";
import {AliyunSmsConfig} from "@/TsModel/Alien/Entity/AppConf/AliyunSmsConfig";

/** 阿里云能力集合配置。*/
export interface AliyunConfig {
		/** DashVector 配置。*/
		DashVector?: AliyunDashVectorConfig | null;
		/** 百练大模型配置。*/
		Bailian?: AliyunBailianConfig | null;
		/** 日志服务配置。*/
		AliyunSls?: AliyunSlsConf | null;
		/** 短信服务配置。*/
		SmsConf?: AliyunSmsConfig | null;
}
