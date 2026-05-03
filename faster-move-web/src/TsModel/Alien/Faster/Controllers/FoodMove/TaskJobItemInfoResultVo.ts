import {ShopInfoVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/ShopInfoVo";
import {FoodMoveTaskStage} from "@/TsModel/Alien/Entity/Enums/FoodMoveTaskStage";
import {JobStatus} from "@/TsModel/Alien/Entity/Enums/JobStatus";

/** 获取任务列表的结果结构*/
export interface TaskJobItemInfoResultVo {
		/** 任务ID*/
		TaskId: string;
		/** 老店信息*/
		OldShop?: ShopInfoVo | null;
		/** 新店信息*/
		NewShop?: ShopInfoVo | null;
		/** 任务阶段列表*/
		TaskStages?: FoodMoveTaskStage[] | null;
		/** 当前阶段*/
		CurrentStage?: FoodMoveTaskStage | null;
		/** 任务名称*/
		TaskName: string;
		/** 任务备注*/
		Remark?: string | null;
		/** 任务状态*/
		JobStatus: JobStatus;
		/** 当前进度*/
		Progress: number;
		/** 总任务数*/
		Total: number;
		/** 进度百分比*/
		CurrPercent: number;
		/** 成功数量*/
		SuccessCount: number;
		/** 失败数量*/
		FailCount: number;
		/** 当前阶段发生的错误信息,如果任务失败*/
		JobErrMsg?: string | null;
		/** 任务创建时间*/
		CreateTime?: Date | null;
}
