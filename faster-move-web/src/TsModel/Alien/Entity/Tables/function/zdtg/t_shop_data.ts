/** 店铺数据*/
import {IShopDataTable} from "@/TsModel/Alien/Entity/Interfaces/IShopDataTable";
export interface t_shop_data extends IShopDataTable {
		id: string;
		/** 日期 年月日 月和日都是2位数需要补00*/
		date: number;
		/** 几点的数据*/
		hour: number;
		/** 曝光人数*/
		show_people: number;
		/** 进店人数*/
		come_people: number;
		/** 下单人数*/
		order_people: number;
		/** 下单转化率*/
		order_cro: number;
		/** 进店转化率*/
		come_cro: number;
		/** 营业额*/
		turnover: number;
		/** 有效订单量*/
		order_num: number;
		/** 收入*/
		income: number;
		IsHolidays: boolean;
}
