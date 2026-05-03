import {WeatherClass} from "@/TsModel/Alien/Controllers/AppData/WeatherClass";
import {t_wmt_home_day} from "@/TsModel/Alien/Entity/Tables/AppData/t_wmt_home_day";
import {t_biz_calendar} from "@/TsModel/Alien/Entity/Tables/Business/t_biz_calendar";
import {MemberDataMonthClass} from "@/TsModel/Alien/Controllers/AppData/MemberDataMonthClass";
import {MemberDataMonthClassShop} from "@/TsModel/Alien/Controllers/AppData/MemberDataMonthClassShop";
import {CalenderCount} from "@/TsModel/Alien/Controllers/AppData/CalenderCount";
import {AdminBalanceTop} from "@/TsModel/Alien/Controllers/AppData/AdminBalanceTop";

export interface AppHomeDataVo {
		/** 当前城市天气(可能为空)*/
		weather?: WeatherClass | null;
		/** 最近七日数据*/
		last_week: t_wmt_home_day[];
		/** 待办事项和更新记录*/
		calendar_top10: t_biz_calendar[];
		/** 更新记录*/
		update_top10: t_biz_calendar[];
		/** 月度成员数据排行*/
		month_pay_member: MemberDataMonthClass[];
		/** 月度名下成员数排行*/
		month_member_count: MemberDataMonthClass[];
		/** 月度名下店铺数排行*/
		month_shop_count: MemberDataMonthClassShop[];
		/** 待办事项统计*/
		calendar_count: CalenderCount;
		/** 团队成员*/
		BalanceTop: AdminBalanceTop[];
}
