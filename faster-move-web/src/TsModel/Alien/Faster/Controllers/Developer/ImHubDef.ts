import {HubMethodDef} from "@/TsModel/Alien/Faster/Controllers/Developer/HubMethodDef";
import {HubEventDef} from "@/TsModel/Alien/Faster/Controllers/Developer/HubEventDef";

/** ImHub 定义*/
export interface ImHubDef {
		/** Hub 访问地址*/
		Url: string;
		/** Hub 描述*/
		Description: string;
		/** 客户端方法列表*/
		ClientMethods: HubMethodDef[];
		/** 服务端事件列表*/
		ServerEvents: HubEventDef[];
}
