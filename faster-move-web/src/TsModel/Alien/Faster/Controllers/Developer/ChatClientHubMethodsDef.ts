import {HubMethodInfo} from "@/TsModel/Alien/Faster/Controllers/Developer/HubMethodInfo";

/** SignalR Hub 方法定义*/
export interface ChatClientHubMethodsDef {
		/** 服务端方法（客户端调用）*/
		ServerMethods: HubMethodInfo[];
		/** 客户端方法（服务端调用）*/
		ClientMethods: HubMethodInfo[];
}
