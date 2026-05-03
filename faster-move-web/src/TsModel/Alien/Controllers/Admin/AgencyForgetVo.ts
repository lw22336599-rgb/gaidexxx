import {AdmiPhoneResultType} from "@/TsModel/Alien/Entity/AdmiPhoneResultType";

/** 忘记密码的参数*/
export interface AgencyForgetVo {
		/** 用户名必须是手机号*/
		phone: string;
		/** 密码*/
		p: string;
		p1: string;
		/** Google Authenticator 验证码（必填）*/
		ga_code: string;
		/** 手机验证码结果*/
		ResultType: AdmiPhoneResultType;
}
