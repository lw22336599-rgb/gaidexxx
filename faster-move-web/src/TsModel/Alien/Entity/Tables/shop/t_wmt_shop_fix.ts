import {ShopLoginResultType} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginResultType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_shop_fix extends BaseSys {
		/** 掉线店铺*/
		shop: string;
		/** 表示是否需要再试一次*/
		try_again?: boolean | null;
		fix_res: ShopLoginResultType;
}
