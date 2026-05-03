import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 调用店铺call时的参数*/
export interface Call_parm {
		shop_type: ShopType;
		shop: string;
		method: string;
		func_code: string;
		parm_obj?: any | null;
}
