import {ImSessionInfo} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImSessionInfo";
import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ImNewMessageVO} from "@/TsModel/Alien/Entity/MessagePackage/ImMsg/ImNewMessageVO";

/** IM新消息，平台推送客户消息时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnImNewMessage extends IMessagePackage {
		IsFromSelf: boolean;
		/** 会话信息,平台就返回*/
		SessionInfo?: ImSessionInfo | null;
		MessageType: MessageTypes;
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** IM消息信息*/
		MessageInfo: ImNewMessageVO;
}
