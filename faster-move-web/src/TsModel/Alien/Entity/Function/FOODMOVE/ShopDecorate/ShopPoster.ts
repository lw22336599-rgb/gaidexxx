import {FoodImage} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodImage";
import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {TimeSpanScope} from "@/TsModel/Alien/Entity/TimeSpanScope";

/** 店铺海报*/
export interface ShopPoster {
		/** 官方id 可有没有 目前只有饿了么采集*/
		OfficeId?: string | null;
		/** 名称 只有饿了么有*/
		Name?: string | null;
		/** 海报图片*/
		ImgUrl: FoodImage;
		/** 关联商品
美团最多50个
饿了么最多20个*/
		LinkFoodSpus?: string[] | null;
		/** 生效时间范围（目前只有饿了么有）*/
		TimeScope?: DateTimeScope | null;
		/** 一周中哪些天显示*/
		WeekDays?: DayType[] | null;
		/** 一天中哪些时段有效*/
		DayTimeScopes?: TimeSpanScope[] | null;
}
