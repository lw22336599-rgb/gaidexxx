import {plan_offer_fool} from "@/TsModel/Alien/Entity/Function/ZDTG/plan_offer_fool";

export interface AutoAdType_conf_fool {
		/** 覆盖所有出价策略用这个出价,如果为-1就以 Plan_Offers 为准*/
		offer_anyway: number;
		/** 傻瓜推广策略列表*/
		Plan_Offers: plan_offer_fool[];
}
