import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 根据门店ID批量获取店铺信息请求参数*/
export interface GetShopsByOfficeIdsParm {
		/** 店铺类型*/
		ShopType: ShopType;
		/** 门店ID列表（每行一个，去重去空）*/
		OfficeIds: string[];
		/** 功能编码，用于返回指定功能的到期时间（可选）*/
		FunctionCode?: string | null;
}
