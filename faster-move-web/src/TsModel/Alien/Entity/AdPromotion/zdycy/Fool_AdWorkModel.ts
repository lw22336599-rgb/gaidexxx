import {plan_offer_fool} from "@/TsModel/Alien/Entity/Function/ZDTG/plan_offer_fool";

export interface Fool_AdWorkModel {
		/** 当前的出价策略,当前的小时段 如果为null 就代表还未初始化成功,因为切换策略时.需要把今日预算设置成功*/
		Offer?: plan_offer_fool | null;
		/** 上次设置的分钟 如果为null 就表示当前分钟未执行或失败*/
		NowMinute?: number | null;
		/** 表示是否已成功向平台提交当前出价 当 NowMinute 变化时. 此值应置null 等于null时就要去平台出价了*/
		HasBidding?: boolean | null;
}
