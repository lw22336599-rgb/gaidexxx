import {Filter_ShopTimeState} from "@/TsModel/Alien/Controllers/Shop/Filter_ShopTimeState";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";
import {Filter_FuncState} from "@/TsModel/Alien/Controllers/Shop/Filter_FuncState";

export interface Filter {
		/** 过滤店铺到期时间(非功能)*/
		time_state?: Filter_ShopTimeState | null;
		/** 店铺类型(必需,后期会按此字段分库分表)*/
		shopType: ShopType;
		/** 门店名称或官方id,备份也支持搜索*/
		word?: string | null;
		/** 指定分组*/
		group?: string | null;
		/** 指定店铺状态*/
		state?: ShopState | null;
		/** 店铺正常授权 即dk 有效*/
		ck_online?: boolean | null;
		/** 指定哪些城市*/
		citys?: string[] | null;
		/** 过滤功能*/
		func_code?: string | null;
		/** 功能即将到期*/
		func_state?: Filter_FuncState | null;
		/** 启铺是否启用*/
		avtag?: boolean | null;
}
