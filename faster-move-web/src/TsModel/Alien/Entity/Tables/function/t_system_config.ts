/** 系统配置实体，存储系统级配置信息（key-value模式）*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_system_config extends BaseSys {
		/** 配置键（唯一标识，如：customer_service_url、download_url、business_contact）*/
		config_key: string;
		/** 配置值*/
		config_value: string;
		/** 配置描述*/
		description: string;
}
