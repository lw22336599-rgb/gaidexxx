import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopFunctionStopVO} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopFunctionStopVO";

/** 店铺功能停止消息，当店铺的某个功能意外停止时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnShopFunctionStop extends IMessagePackage {
		MessageType: MessageTypes;
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** 店铺功能停止信息*/
		FunctionStopInfo: ShopFunctionStopVO;
}
