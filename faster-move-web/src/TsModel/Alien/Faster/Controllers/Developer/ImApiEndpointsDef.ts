import {ApiEndpoint} from "@/TsModel/Alien/Faster/Controllers/Developer/ApiEndpoint";

/** API 端点定义*/
export interface ImApiEndpointsDef {
		/** 会话相关端点*/
		Session: ApiEndpoint[];
		/** 客服管理相关端点*/
		Admin: ApiEndpoint[];
		/** 消息管理相关端点*/
		Manage: ApiEndpoint[];
}
