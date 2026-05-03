import {EvaluationType} from "@/TsModel/Alien/Entity/Enums/EvaluationType";
import {AppealStatus} from "@/TsModel/Alien/Entity/Enums/AppealStatus";

/** 店铺评价申诉信息*/
export interface ShopAppealInfo {
		/** 评价唯一标识（平台返回的评价ID）*/
		id: string;
		/** 平台评价ID（offid）*/
		Offid: string;
		/** 评价内容*/
		Content?: string | null;
		/** 评价星数*/
		Stars: number;
		/** 评价类型*/
		EvaluationType: EvaluationType;
		/** 评价时间*/
		Time?: Date | null;
		/** 申诉状态（某些平台会在列表中直接返回）*/
		AppealStatus?: AppealStatus | null;
		/** 申诉结果说明（某些平台会在列表中直接返回）*/
		AppealResultMsg?: string | null;
}
