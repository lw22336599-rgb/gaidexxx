import {CalendarType} from "@/TsModel/Alien/Entity/Enums/Business/CalendarType";
import {CalendarState} from "@/TsModel/Alien/Entity/Enums/Business/CalendarState";

/** 待办事项*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_biz_calendar extends BaseSys {
		/** 所属用户*/
		admin: string;
		/** 事项标题*/
		name: string;
		/** 事项内容*/
		content: string;
		/** 优先级 越小越往前*/
		top: number;
		/** 事项类型,公告,更新日志,待办事件*/
		type: CalendarType;
		/** 状态*/
		state: CalendarState;
}
