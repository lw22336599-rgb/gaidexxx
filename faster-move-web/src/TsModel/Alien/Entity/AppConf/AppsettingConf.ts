import {LoggingSettings} from "@/TsModel/Alien/Entity/AppConf/LoggingSettings";
import {DbConfig} from "@/TsModel/Alien/Entity/AppConf/DbConfig";
import {RabbitMQConfig} from "@/TsModel/Alien/Entity/AppConf/RabbitMQConfig";
import {ServerConfig} from "@/TsModel/Alien/Entity/AppConf/ServerConfig";
import {JwtSettings} from "@/TsModel/Alien/Entity/AppConf/JwtSettings";
import {AliyunOssConf} from "@/TsModel/Alien/Entity/AppConf/AliyunOssConf";
import {RedisConfig} from "@/TsModel/Alien/Entity/AppConf/RedisConfig";
import {OrleansConfig} from "@/TsModel/Alien/Entity/AppConf/OrleansConfig";
import {ImConfig} from "@/TsModel/Alien/Entity/AppConf/ImConfig";
import {ElmOfficeLsConfig} from "@/TsModel/Alien/Entity/AppConf/ElmOfficeLsConfig";
import {ElmWaiMaiConfig} from "@/TsModel/Alien/Entity/AppConf/ElmWaiMaiConfig";
import {JdOfficeLsConfig} from "@/TsModel/Alien/Entity/AppConf/JdOfficeLsConfig";
import {AliyunConfig} from "@/TsModel/Alien/Entity/AppConf/AliyunConfig";
import {GrainRecoveryConfig} from "@/TsModel/Alien/Entity/AppConf/GrainRecoveryConfig";
import {PaylinksConfig} from "@/TsModel/Alien/Entity/AppConf/PaylinksConfig";

/** 统一映射 appsettings*.json 的根配置，对所有项目配置提供强类型访问。*/
export interface AppsettingConf {
		/** Furion 配置文件 schema 地址（部分项目使用）。*/
		Schema?: string | null;
		/** 日志配置。*/
		Logging: LoggingSettings;
		/** 动态接口约定配置。*/
		DynamicApiControllerSettings?: Furion.DynamicApiController.DynamicApiControllerSettingsOptions | null;
		/** Swagger 文档配置。*/
		SpecificationDocumentSettings?: Furion.SpecificationDocument.SpecificationDocumentSettingsOptions | null;
		/** 当前运行模式配置（部分项目使用）。*/
		Model?: string | null;
		/** 允许的主机名通配符配置。*/
		AllowedHosts?: string | null;
		/** 连接字符串配置。*/
		HangfireDb: DbConfig;
		/** RabbitMQ 配置。*/
		RabbitMQ: RabbitMQConfig;
		/** 服务端地址配置。*/
		Server?: ServerConfig | null;
		/** JWT 配置。*/
		JwtSettings?: JwtSettings | null;
		/** OSS 长久文件存储配置。*/
		OssConfLong?: AliyunOssConf | null;
		/** OSS 临时文件存储配置。*/
		OssConfTemp?: AliyunOssConf | null;
		/** Redis 连接配置。*/
		Redis: RedisConfig;
		/** Orleans 配置。*/
		Orleans: OrleansConfig;
		/** IM 客服系统配置。*/
		IM: ImConfig;
		/** 数据库连接配置。*/
		Db?: DbConfig | null;
		/** 商品复制数据库,需要隔离*/
		FdmvDb?: DbConfig | null;
		/** 饿百零售开放平台配置。*/
		ElmOfficeLs?: ElmOfficeLsConfig | null;
		/** 饿了么外卖开放平台配置。*/
		ElmWaiMai?: ElmWaiMaiConfig | null;
		/** 京东开放平台配置。*/
		JdOfficeLs?: JdOfficeLsConfig | null;
		/** 阿里云相关配置集合。*/
		Aliyun?: AliyunConfig | null;
		/** Orleans Grain 恢复配置。*/
		GrainRecovery?: GrainRecoveryConfig | null;
		/** 支付渠道配置集合。*/
		Paylinks?: PaylinksConfig | null;
		/** 食品管理数据库配置。*/
		FoodManageDb?: DbConfig | null;
}
