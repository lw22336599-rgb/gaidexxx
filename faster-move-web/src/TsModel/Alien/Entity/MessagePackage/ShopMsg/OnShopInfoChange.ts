import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopInfoChangeVO} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopInfoChangeVO";
import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";

/** 店铺信息变更消息，平台推送店铺信息变更时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnShopInfoChange extends IMessagePackage {
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** 店铺信息变更信息*/
		InfoChange: ShopInfoChangeVO;
		MessageType: MessageTypes;
}
