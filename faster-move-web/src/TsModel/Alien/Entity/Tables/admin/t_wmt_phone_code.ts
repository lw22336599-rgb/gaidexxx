/** 存放已发送的手机验证码*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_phone_code extends BaseSysExTime {
		/** 手机号*/
		Phone: string;
		/** 验证码*/
		Code: string;
		IsSend: boolean;
}
