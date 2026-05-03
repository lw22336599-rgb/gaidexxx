import {ZNBB_AD_item} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_AD_item";

/** 智能报表-推广*/
export interface ZNBB_AD {
		/** 昨日*/
		Yday?: ZNBB_AD_item[] | null;
		/** 近7日*/
		Last7?: ZNBB_AD_item[] | null;
		/** 近30日*/
		Last30?: ZNBB_AD_item[] | null;
}
