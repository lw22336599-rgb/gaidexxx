/** 客户端（员工）报告*/
export interface ClientReport {
		Version: string;
		/** 客户端标识 ，也就当成员工名了*/
		MyName: string;
		/** 工作数量（有多少个店在工作）*/
		NumberOfJobs: number;
		/** 每次完成所有工作花了多少秒*/
		FinishAllJobTime: number;
}
