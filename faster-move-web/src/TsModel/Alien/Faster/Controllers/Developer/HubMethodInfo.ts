import {MethodParameter} from "@/TsModel/Alien/Faster/Controllers/Developer/MethodParameter";

/** Hub 方法信息*/
export interface HubMethodInfo {
		/** 方法名*/
		Name: string;
		/** 方法描述*/
		Description: string;
		/** 参数列表*/
		Parameters: MethodParameter[];
		/** 返回类型*/
		ReturnType: string;
		/** 返回值描述*/
		ReturnDescription: string;
}
