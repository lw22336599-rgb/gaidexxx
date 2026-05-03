import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 分页获取功能价格列表的请求参数*/
export interface GetFunctionPricePageParm {
		/** 页码,从1开始*/
		page: number;
		/** 每页数量*/
		pageSize: number;
		/** 可选的店铺类型筛选条件,为空时不过滤*/
		ShopType?: ShopType | null;
		/** 可选的价格名称模糊搜索关键字*/
		priceTitle?: string | null;
		/** 可选的功能代码精确搜索条件*/
		funcCode?: string | null;
}
