import {ImSessionInfo} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImSessionInfo";
import {ImOrderDetailVo} from "@/TsModel/Alien/Entity/Function/IM/ImOrderDetailVo";
import {WaitReplyMsg} from "@/TsModel/Alien/Entity/Function/IMZDHF/WaitReplyMsg";
import {AutomaticReplyConf} from "@/TsModel/Alien/Entity/Function/IMZDHF/AutomaticReplyConf";
import {ImzdhfFunctionInfoVo} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImzdhfFunctionInfoVo";

/** 功能相关模型定义*/
export interface ImFunctionModelsDef {
		/** 会话信息*/
		SessionInfo: ImSessionInfo;
		/** 订单详情*/
		OrderDetail: ImOrderDetailVo;
		/** 等待回复消息*/
		WaitReplyMsg: WaitReplyMsg;
		/** 自动回复配置*/
		AutoReplyConf: AutomaticReplyConf;
		/** 功能信息*/
		FunctionInfo: ImzdhfFunctionInfoVo;
}
