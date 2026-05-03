import {ImMessage} from "@/TsModel/Alien/Entity/Messages/ImMessage";
import {ImSessionAssignedMessage} from "@/TsModel/Alien/Entity/Messages/ImSessionAssignedMessage";
import {ImSessionTransferredMessage} from "@/TsModel/Alien/Entity/Messages/ImSessionTransferredMessage";
import {ImSessionStatusChangedMessage} from "@/TsModel/Alien/Entity/Messages/ImSessionStatusChangedMessage";
import {ImSessionTagsUpdatedMessage} from "@/TsModel/Alien/Entity/Messages/ImSessionTagsUpdatedMessage";
import {ImSessionRemarksUpdatedMessage} from "@/TsModel/Alien/Entity/Messages/ImSessionRemarksUpdatedMessage";

/** IM 消息类型定义*/
export interface ImMessagesDef {
		/** IM 消息*/
		ImMessage: ImMessage;
		/** IM会话分配消息*/
		ImSessionAssignedMessage: ImSessionAssignedMessage;
		/** IM会话转交消息*/
		ImSessionTransferredMessage: ImSessionTransferredMessage;
		/** IM会话状态变更消息*/
		ImSessionStatusChangedMessage: ImSessionStatusChangedMessage;
		/** IM会话标签更新消息*/
		ImSessionTagsUpdatedMessage: ImSessionTagsUpdatedMessage;
		/** IM会话备注更新消息*/
		ImSessionRemarksUpdatedMessage: ImSessionRemarksUpdatedMessage;
}
