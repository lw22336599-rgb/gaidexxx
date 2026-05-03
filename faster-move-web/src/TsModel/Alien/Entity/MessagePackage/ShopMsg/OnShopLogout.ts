import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopLogoutVO} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/ShopLogoutVO";
import {AuthType} from "@/TsModel/Alien/Entity/Enums/AuthType";

/** 店铺掉线消息，当客户端检测到店铺登录失效或连接断开时触发*/
import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface OnShopLogout extends IMessagePackage {
		MessageType: MessageTypes;
		ReceiveTime: Date;
		ShopType: ShopType;
		ShopOffid: string;
		/** 店铺掉线信息*/
		LogoutInfo: ShopLogoutVO;
		/** 来源授权方式 也就是什么方式授权掉了*/
		AuthType: AuthType;
}
