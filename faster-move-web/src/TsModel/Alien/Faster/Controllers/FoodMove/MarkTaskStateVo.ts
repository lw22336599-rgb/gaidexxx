/** 标记任务状态的参数对象*/
export interface MarkTaskStateVo {
		/** 任务ID*/
		TaskId: string;
		/** 是否标记为需人工处理
true: 标记为需人工处理，防止自动删除
false: 取消标记，恢复正常状态，可以被自动删除*/
		IsManualProcessing: boolean;
}
