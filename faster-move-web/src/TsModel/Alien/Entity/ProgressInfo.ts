import {ProgressStatuType} from "@/TsModel/Alien/Entity/Enums/ProgressStatuType";

/** 进度信息*/
export interface ProgressInfo {
		/** 如果是每一步代表一个任务项完成,这里会返回任务项信息,可以是 id也可以是对像信息(json)*/
		Item?: string | null;
		/** 已经完成*/
		IsFinished: boolean;
		/** IsFinished 为true 此项不为空表明任务执行失败了 且附加了信息 前端需要弹出来*/
		ExceptionMsg?: string | null;
		/** 总数*/
		Total: number;
		/** 进度*/
		Progress: number;
		/** 错误消息*/
		ErrMsg?: string[] | null;
		JobId: string;
		Status: ProgressStatuType;
}
