import {ShopExtraFuncInfo} from "@/TsModel/Alien/Entity/Tables/shop/ShopExtraFuncInfo";
import {WorkTime_Info} from "@/TsModel/Alien/Entity/Function/APPDATA/WorkTime_Info";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";

/** 针对店铺的额外信息*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_shop_extra extends BaseSys {
		/** 店铺*/
		shop: string;
		/** GROUP_CONCAT(    JSON_OBJECT(CASE WHEN t2.function_code IS NULL THEN '' ELSE t2.function_code END, t2.`enable` )) AS func_enable,*/
		func_enable: ShopExtraFuncInfo[];
		/** 营业时间*/
		work_time: WorkTime_Info;
		/** 天气描述*/
		weather?: string | null;
		/** 天气度数*/
		weather_num?: number | null;
		/** 月售*/
		month_sale?: number | null;
		/** 开业天数*/
		open_days?: number | null;
		/** 今日收入*/
		income?: number | null;
		/** 昨日同时段收入*/
		income_y?: number | null;
		/** 有效订单量*/
		order_num?: number | null;
		/** 有效订单量-昨日同时段*/
		order_num_y?: number | null;
		/** 曝光人数*/
		show_num?: number | null;
		/** 曝光人数比-昨日同时段*/
		show_y?: number | null;
		/** 入店转换率*/
		in_ratio?: number | null;
		/** 入店转换率- 昨日同时段*/
		in_ratio_y?: number | null;
		/** 下单转换率-昨日同时段*/
		order_ratio?: number | null;
		/** 下单转换率-昨日同时段*/
		order_ratio_y?: number | null;
		/** 单均到手*/
		avg_income?: number | null;
		/** 段单均到手-昨日同时*/
		avg_income_y?: number | null;
		/** 推广曝光量*/
		ad_show_num?: number | null;
		/** 推广曝光量-昨日同时段*/
		ad_show_num_y?: number | null;
		/** 推广进店量*/
		ad_in_num?: number | null;
		/** 推广进店量-昨日同时段*/
		ad_in_num_y?: number | null;
		/** 推广进店率*/
		ad_in_ratio?: number | null;
		/** 推广进店率-昨日同时段*/
		ad_in_ratio_y?: number | null;
		/** 单次进店成本*/
		ad_in_cost?: number | null;
		/** 单次进店成本-昨日同时段*/
		ad_in_cost_y?: number | null;
		/** 推广消耗(当前消耗)*/
		ad_pay?: number | null;
		/** 今日预算(也是广告预算)*/
		ad_budget?: number | null;
		/** 推广余额*/
		ad_balance?: number | null;
		/** 当前出价*/
		ad_bid?: number | null;
		/** 店铺地址*/
		shop_addr?: string | null;
		/** 门店公告*/
		shop_notice?: string | null;
		/** 门店电话*/
		shop_phone?: string | null;
		/** 门店二维码(base64或图片url)*/
		shop_qrcode?: string | null;
		/** 经营品类*/
		category?: string | null;
		/** 周几营业*/
		week_work?: DayType[] | null;
		/** 店铺分数(昨日)*/
		score?: number | null;
}
