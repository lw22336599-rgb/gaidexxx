import {ShopList_ResulItem_Extra} from "@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem_Extra";

/** 根据门店ID批量获取店铺信息返回结果*/
export interface GetShopsByOfficeIdsResult {
		/** 找到的店铺列表（与 GetShopListV2 格式一致）*/
		Shops: ShopList_ResulItem_Extra[];
		/** 未找到的门店ID列表*/
		NotFoundOfficeIds: string[];
}
