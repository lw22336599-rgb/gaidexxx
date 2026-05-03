import {ActivityType_ZheKou_SetType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivitTypes/ActivityType_ZheKou_SetType";
import * as Comm from '@/TsModel/Comm/Comm';

export interface ActivityType_ZheKou_Item {
		/** 活动id*/
		OfficeId?: string | null;
		/** 商品id*/
		SpuId: string;
		/** 商品规格属性id*/
		SkuId: string;
		/** 优惠设置方式  按折扣=0, 按折后价=1*/
		SettingType: ActivityType_ZheKou_SetType;
		/** 限购份数*/
		OrderLimit: number;
		/** 库存份数*/
		DayLimit: number;
		/** 零售可能有 活动期间，该活动商品每个门店总共可售卖的数量*/
		Stock?: number | null;
		/** 折扣 如 9.8折 就是 9.8*/
		Discount: number;
		/** 原价*/
		OriginPrice: number;
		/** 拆后价格。 如果以 Discount 去算会有精度问题，要尽量以这个来设置 设置时会优先以这个为准*/
		ActPrice?: number | null;
		/** 商家承担 可能没有值 ，美团有*/
		PoiCharge?: number | null;
		/** sku 名称 也就是选项名称*/
		SkuName?: string | null;
		/** 选项路径*/
		SpecPath?: string[] | null;
		/** 其他参数,如饿了么可能会有多个id等情况*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
