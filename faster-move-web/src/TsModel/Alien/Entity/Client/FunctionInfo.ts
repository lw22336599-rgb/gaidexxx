import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

export interface FunctionInfo {
		/** 店铺类型*/
		ShopType: ShopType;
		/** 功能编码*/
		Code: string;
		/** 功能名称*/
		Name: string;
		/** 功能描述*/
		Description: string;
		/** 表示此功能在访问时需要自动启动 已经不适用了*/
		AutoRun: boolean;
		/** 多少秒执行一次 小于2 都代表不自动执行*/
		AutoRunSec: number;
		/** 续费后是否自动执行*/
		AutoRenewRun: boolean;
}
