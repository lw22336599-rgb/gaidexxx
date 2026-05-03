import {AppUserInfo} from "@/TsModel/Alien/Entity/AppUserInfo";
import {AppInfo} from "@/TsModel/Alien/Entity/Conf/AppInfo";
import {AdmiPhoneResultType} from "@/TsModel/Alien/Entity/AdmiPhoneResultType";

export interface AppUserLoginRes {
		/** 登陆后返回的token*/
		Token: string;
		UserInfo: AppUserInfo;
		/** 邀请码*/
		Invite_Code: number;
		/** 团队id*/
		Team_Id: number;
		/** 上级代理的应用信息*/
		AppInfo?: AppInfo | null;
		/** 是否为代理*/
		IsAgency: boolean;
		/** 是否需要输入 Google Authenticator 验证码*/
		RequireGoogleAuthenticator: boolean;
		ResultType: AdmiPhoneResultType;
}
