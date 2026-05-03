import {ZNBB_Traffic_item} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Traffic_item";

export interface ZNBB_Traffic {
		/** 昨日*/
		Yday?: ZNBB_Traffic_item | null;
		/** 近7日*/
		Last7?: ZNBB_Traffic_item | null;
		/** 近30日*/
		Last30?: ZNBB_Traffic_item | null;
}
