import {WaitReplyMsg} from "@/TsModel/Alien/Entity/Function/IMZDHF/WaitReplyMsg";
import {ImSessionInfo} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImSessionInfo";

/** OnNewMsg 调用数据*/
export interface OnNewMsgCallData {
		Msg: WaitReplyMsg;
		SessionInfo?: ImSessionInfo | null;
}
