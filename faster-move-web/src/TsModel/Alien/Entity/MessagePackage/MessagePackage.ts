import {MessageTypes} from "@/TsModel/Alien/Entity/Enums/MessageTypes";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

import {IMessagePackage} from "@/TsModel/Alien/Entity/Interfaces/IMessagePackage";
export interface MessagePackage extends IMessagePackage {
		MessageType: MessageTypes;
		ShopType: ShopType;
		ShopOffid: string;
}
