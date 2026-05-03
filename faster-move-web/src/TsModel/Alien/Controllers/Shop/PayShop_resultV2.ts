import {FuncEndTimeItem} from "@/TsModel/Alien/Controllers/Shop/FuncEndTimeItem";

export interface PayShop_resultV2 {
		/** 花费*/
		Spent: number;
		/** 新的到期时间*/
		FuncInfo: FuncEndTimeItem[];
		ShopNewEndTime: Date;
		/** 添加了多少天的时间*/
		AddDays: number;
}
