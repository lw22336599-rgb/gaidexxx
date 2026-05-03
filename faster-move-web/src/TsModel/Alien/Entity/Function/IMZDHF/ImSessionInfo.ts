import {ImSessionUser} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImSessionUser";
import {ImSessionOrder} from "@/TsModel/Alien/Entity/Function/IMZDHF/ImSessionOrder";

/** 有新的聊天对像时,储存了新会话的基本信息*/
export interface ImSessionInfo {
		/** 用户基本信息*/
		User: ImSessionUser;
		/** 会话订单.可能没有*/
		Order?: ImSessionOrder | null;
}
