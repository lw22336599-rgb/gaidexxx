import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopLoginType} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginType";
import {ShopRequestType} from "@/TsModel/Alien/Entity/ShopLogin/ShopRequestType";

export interface ShopLoginParms {
		/** 登陆网站类型*/
		SiteType: ShopType;
		/** 登陆方式*/
		LoginType: ShopLoginType;
		/** 请求类型*/
		RequestType: ShopRequestType;
		/** 账号密码登陆*/
		UserName: string;
		PassWord: string;
		/** 验证码登陆, 手机号*/
		Phone: string;
		PhoneCode: string;
		/** LoginType == 4 时必填*/
		Cookies?: string | null;
}
