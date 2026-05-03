import {AuthType} from "@/TsModel/Alien/Entity/Enums/AuthType";

/** 店铺掉线VO*/
export interface ShopLogoutVO {
		/** 店铺ID*/
		ShopId: string;
		/** 掉线原因*/
		Reason?: string | null;
		/** 掉线时间*/
		LogoutTime: Date;
		/** 授权类型：OAuth 或 Cookies*/
		AuthType: AuthType;
}
