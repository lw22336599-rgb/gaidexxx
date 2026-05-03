import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import * as Comm from '@/TsModel/Comm/Comm';

/** 平台功能上下文*/
export interface SiteFunctionContext {
		Dic_ShopInfo: Comm.Dictionary<ShopType, any>;
		Dic_ShopInfoAuth: Comm.Dictionary<ShopType, any>;
		Dic_IShopLogin: Comm.Dictionary<ShopType, any>;
		Dic_FoodMoveManager: Comm.Dictionary<ShopType, any>;
		Dic_IChainShop: Comm.Dictionary<ShopType, any>;
		Dic_IChainShopAuth: Comm.Dictionary<ShopType, any>;
		Dic_IGetShopGroups: Comm.Dictionary<ShopType, any>;
}
