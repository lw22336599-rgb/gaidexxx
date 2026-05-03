import {AutoAdType} from "@/TsModel/Alien/Entity/Enums/AutoAdType";
import {AutoAdType_conf_znms} from "@/TsModel/Alien/Entity/Function/ZDTG/AutoAdType_conf_znms";
import {AutoAdType_conf_zdycy} from "@/TsModel/Alien/Entity/Function/ZDTG/AutoAdType_conf_zdycy";
import {AutoAdType_conf_fool} from "@/TsModel/Alien/Entity/Function/ZDTG/AutoAdType_conf_fool";

export interface AutoAdConf {
		/** 智能推广类型*/
		AutoAdType: AutoAdType;
		/** 投放开始时间*/
		StarTime: Date;
		/** 投放结束时间*/
		EndTime: Date;
		/** 智能推广策略设置*/
		AutoAdType_znms?: AutoAdType_conf_znms | null;
		/** 自定义策略设置*/
		AutoAdType_zdycy?: AutoAdType_conf_zdycy | null;
		/** 傻瓜模式*/
		AutoAdType_fool?: AutoAdType_conf_fool | null;
}
