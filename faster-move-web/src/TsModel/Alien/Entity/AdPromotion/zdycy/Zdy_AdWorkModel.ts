import {plan_offer} from "@/TsModel/Alien/Entity/Function/ZDTG/plan_offer";

/** 自定义策略推广的工作模型*/
export interface Zdy_AdWorkModel {
		/** 当前的出价策略,当前的小时段 如果为null 就代表还未初始化成功,因为切换策略时.需要把今日预算设置成功*/
		Offer?: plan_offer | null;
		/** 上次设置到平台的预算*/
		NowBudget?: number | null;
		/** 上次设置的分钟 如果为null 就表示当前分钟未执行或失败*/
		NowMinute?: number | null;
		/** 表示是否已成功向平台提交当前出价 当 NowMinute 变化时. 此值应置null*/
		HasBidding?: boolean | null;
}
