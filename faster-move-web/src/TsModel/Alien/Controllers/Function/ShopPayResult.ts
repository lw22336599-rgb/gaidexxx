import {FuncEndTimeItem} from "@/TsModel/Alien/Controllers/Shop/FuncEndTimeItem";

/** 单个店铺续费结果*/
export interface ShopPayResult {
		/** 店铺ID*/
		ShopId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 店铺新的到期时间*/
		NewEndTime: Date;
		/** 功能续费详情*/
		FuncInfo: FuncEndTimeItem[];
}
