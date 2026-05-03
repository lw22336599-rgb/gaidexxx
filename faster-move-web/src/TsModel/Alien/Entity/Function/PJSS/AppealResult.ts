import {AppealStatus} from "@/TsModel/Alien/Entity/Enums/AppealStatus";

/** 申诉结果*/
export interface AppealResult {
		/** 申诉状态*/
		Status: AppealStatus;
		/** 申诉结果说明（如失败原因等）*/
		Result?: string | null;
}
