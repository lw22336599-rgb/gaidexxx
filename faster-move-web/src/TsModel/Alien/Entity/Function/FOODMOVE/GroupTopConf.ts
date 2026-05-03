import {DateTimeScope} from "@/TsModel/Alien/Entity/DateTimeScope";
import {FoodSellTimeDay} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodSellTimeDay";

/** 分组置顶设置*/
export interface GroupTopConf {
		/** 限时置顶 true 开启，false 关闭*/
		IsTop: boolean;
		/** 置顶时间范围 目前只有饿了么有 美团没有*/
		TopTimeRange?: DateTimeScope | null;
		/** 置顶时间段 为空就代表全天*/
		TopTimeScopes?: FoodSellTimeDay[] | null;
}
