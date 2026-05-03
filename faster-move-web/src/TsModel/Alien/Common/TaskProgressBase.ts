/** 任务进度实现*/
export interface TaskProgressBase {
		MsgList: string[];
		/** 如果执行任务异常 就不会为空*/
		HasException?: System.Exception | null;
		/** 等待执行异步执行*/
		WaitRun: boolean;
		/** 由队列管理类设置. 就是标记下是属于哪个task*/
		Mark: string;
		/** 给正在工作*/
		IsWorking: boolean;
		/** 总任务数*/
		Total: number;
		/** 当前进度*/
		CurrProgress: number;
		/** 成功数量*/
		success_count: number;
		/** 失败数量*/
		fail_count: number;
		/** 当判断到这个属性为true时应该尽快结束当前任务*/
		IsCancel: boolean;
		CancellationToken?: any | null;
}
