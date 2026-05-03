/** 店铺绑定码(5分钟过期)*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_shop_code extends BaseSysExTime {
		/** 绑定码*/
		code: string;
		/** 绑定店铺*/
		shop: string;
}
