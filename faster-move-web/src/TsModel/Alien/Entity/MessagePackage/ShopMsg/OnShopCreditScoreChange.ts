import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopCreditScoreChangeVO} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopCreditScoreChangeVO";

/** 店铺信用分变更消息，平台推送店铺信用分变更时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnShopCreditScoreChange extends IMessagePackage {
		MessageType: MessageTypes;
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** 店铺信用分变更信息*/
		CreditScoreChange: ShopCreditScoreChangeVO;
}
