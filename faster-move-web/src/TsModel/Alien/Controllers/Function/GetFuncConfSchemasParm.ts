import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 批量获取功能 ConfSchema 的请求参数*/
export interface GetFuncConfSchemasParm {
		/** 店铺类型*/
		ShopType: ShopType;
		/** 功能代码列表*/
		FuncCodes: string[];
}
