import {ReplyMessageRequest} from "@/TsModel/Alien/Faster/Controllers/IM/ReplyMessageRequest";
import {TagRequest} from "@/TsModel/Alien/Faster/Controllers/IM/TagRequest";
import {RemarksRequest} from "@/TsModel/Alien/Faster/Controllers/IM/RemarksRequest";
import {CloseSessionRequest} from "@/TsModel/Alien/Faster/Controllers/IM/CloseSessionRequest";
import {TransferSessionRequest} from "@/TsModel/Alien/Faster/Controllers/IM/TransferSessionRequest";

/** API 请求模型定义*/
export interface ImApiRequestsDef {
		/** 回复消息请求*/
		ReplyMessage: ReplyMessageRequest;
		/** 标签请求*/
		Tag: TagRequest;
		/** 备注请求*/
		Remarks: RemarksRequest;
		/** 关闭会话请求*/
		CloseSession: CloseSessionRequest;
		/** 转交会话请求*/
		TransferSession: TransferSessionRequest;
}
