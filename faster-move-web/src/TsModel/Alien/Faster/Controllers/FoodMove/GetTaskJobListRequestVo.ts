import {CreateTaskTypeEnum} from "@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum";
import {FoodMoveTaskStage} from "@/TsModel/Alien/Entity/Enums/FoodMoveTaskStage";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {JobStatus} from "@/TsModel/Alien/Entity/Enums/JobStatus";
import {TaskListSortType} from "@/TsModel/Alien/Faster/Controllers/FoodMove/TaskListSortType";

/** 获取任务列表的请求参数结构*/
import {PageParmsVoBase} from "@/TsModel/Alien/Entity/MethodResult/PageParmsVoBase";
export interface GetTaskJobListRequestVo extends PageParmsVoBase {
		/** 竞对复制或老到新复制*/
		TaskType?: CreateTaskTypeEnum | null;
		/** 新店OfficeId过滤*/
		NewShopOfficeId?: string | null;
		/** 当前阶段过滤*/
		CurrentStage?: FoodMoveTaskStage | null;
		/** 新店类型过滤*/
		NewShopType?: ShopType | null;
		/** 任务名称过滤*/
		TaskName?: string | null;
		/** 任务状态过滤*/
		JobStatus?: JobStatus | null;
		/** 排序方式*/
		SortType: TaskListSortType;
}
