import {ZNBB_Repurchase_item} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Repurchase_item";

/** 复购,回购*/
export interface ZNBB_Repurchase {
		Day7?: ZNBB_Repurchase_item | null;
		Day30?: ZNBB_Repurchase_item | null;
}
