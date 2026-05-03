import {ShopPayResult} from "@/TsModel/Alien/Controllers/Function/ShopPayResult";

/** 批量续费结果*/
export interface BatchPayShop_Result {
		/** 总花费*/
		TotalSpent: number;
		/** 成功续费的店铺数量*/
		SuccessCount: number;
		/** 添加了多少天*/
		AddDays: number;
		/** 每个店铺的续费结果*/
		ShopResults: ShopPayResult[];
}
