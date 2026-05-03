/** 简单的用户管理器实现 - 仅用于登录场景*/
import {IUserManager} from "@/TsModel/Alien/Entity/Interfaces/IUserManager";
export interface SimpleUserManager extends IUserManager {
		UserId: string;
		Account: string;
		Name: string;
		SuperAdmin: boolean;
		Perms: string;
		AgUserId: string;
}
