import {ShopInfo} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopInfo";
import {ShopData_Base} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopData_Base";
import {ShopData_Ad} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopData_Ad";
import {ShopData_Traffic} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopData_Traffic";
import {ShopData_yesterday} from "@/TsModel/Alien/Entity/Function/APPDATA/ShopData_yesterday";
import {WorkTime_Info} from "@/TsModel/Alien/Entity/Function/APPDATA/WorkTime_Info";
import {AdDataV2} from "@/TsModel/Alien/Entity/Function/ZDTG/AdDataV2";

/** 首页数据,营业额等*/
export interface Info {
		shop_reg_time?: Date | null;
		/** 店铺信息 注意此类属性不能覆盖*/
		shop_info: ShopInfo;
		/** 门店实时数据*/
		data_base?: ShopData_Base | null;
		/** 门店推广数据*/
		data_dd?: ShopData_Ad | null;
		/** 实时流量转化 因饿了么采集限制 此值有可能为空*/
		data_Traffic?: ShopData_Traffic | null;
		/** 昨日经营分析*/
		data_Yesterday?: ShopData_yesterday | null;
		/** 工作状态*/
		WorkInfo: WorkTime_Info;
		/** 推广数据V2版*/
		AdDataV2?: AdDataV2 | null;
}
