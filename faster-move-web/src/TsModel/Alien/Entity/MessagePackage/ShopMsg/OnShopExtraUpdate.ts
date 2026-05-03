import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopExtraUpdateVO} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopExtraUpdateVO";

/** 店铺运营数据更新消息，当店铺运营数据（如广告数据）发生变化时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnShopExtraUpdate extends IMessagePackage {
		MessageType: MessageTypes;
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** 店铺运营数据更新信息*/
		ExtraUpdateInfo: ShopExtraUpdateVO;
}
