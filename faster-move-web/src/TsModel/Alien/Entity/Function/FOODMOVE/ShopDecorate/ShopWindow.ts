import {ShopWindowType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopWindowType";
import {ForUserType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ForUserType";
import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {TimeSpanScope} from "@/TsModel/Alien/Entity/TimeSpanScope";

/** 商品橱窗*/
export interface ShopWindow {
		/** 背景图 好像只有美团支持*/
		BackgroundPic?: string | null;
		/** 橱窗类型*/
		WindowType: ShopWindowType;
		/** 针对的客户群体 如果为空就代表全部客户*/
		ForUserType?: ForUserType[] | null;
		/** 在这个时间范围内显示*/
		ShowDate?: DateTimeScope | null;
		/** 在哪些天显示*/
		ShowWeeks?: DayType[] | null;
		/** 在哪些时段显示*/
		ShowTimeSpanScopes?: TimeSpanScope[] | null;
		/** 关联商品 如果为空就是设置不支持.要尽量用系统推荐选项*/
		LinkFoodSpus?: string[] | null;
}
