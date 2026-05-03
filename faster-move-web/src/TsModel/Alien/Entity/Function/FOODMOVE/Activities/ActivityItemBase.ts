import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";
import {UserVistType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/UserVistType";
import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";
import {TimeSpanScope} from "@/TsModel/Alien/Entity/TimeSpanScope";
import * as Comm from '@/TsModel/Comm/Comm';

/** 活动项*/
export interface ActivityItemBase {
		/** 活动类型*/
		ActType: ActivityType;
		/** 活动面向客户*/
		ForUserType: UserVistType;
		/** 活动官方id*/
		OffId?: string | null;
		/** 活动时间范围*/
		TimeScope: DateTimeScope;
		/** 活动在哪些天有效*/
		DayTypes?: DayType[] | null;
		/** 时段 在一天中这些时段活动有效*/
		Period?: TimeSpanScope[] | null;
		/** 活动到期自动延时30天*/
		AuToMonth: boolean;
		/** 其他参数,如饿了么可能会有多个id等情况*/
		OtherValues?: Comm.Dictionary<string, string> | null;
}
