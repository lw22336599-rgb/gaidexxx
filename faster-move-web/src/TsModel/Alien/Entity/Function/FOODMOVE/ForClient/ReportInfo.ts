import {ReportTaskItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ForClient/ReportTaskItem";

/** 客户端向后端报告的消息*/
export interface ReportInfo {
		/** 任务列表*/
		TaskIds?: ReportTaskItem[] | null;
		/** 客户端名称*/
		ClientName: string;
}
