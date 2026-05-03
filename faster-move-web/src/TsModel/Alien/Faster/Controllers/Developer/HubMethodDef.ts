import * as Comm from '@/TsModel/Comm/Comm';

/** Hub 方法定义*/
export interface HubMethodDef {
		/** 方法名称*/
		Name: string;
		/** 方法描述*/
		Description?: string | null;
		/** 方法参数（参数名 -> 参数类型）*/
		Parameters: Comm.Dictionary<string, string>;
}
