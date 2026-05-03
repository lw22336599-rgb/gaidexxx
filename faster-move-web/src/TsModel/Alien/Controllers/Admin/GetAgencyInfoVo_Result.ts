import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";
import {ShopCount_item} from "@/TsModel/Alien/Controllers/Admin/ShopCount_item";
import {ShopExtraCount} from "@/TsModel/Alien/Controllers/Admin/ShopExtraCount";

export interface GetAgencyInfoVo_Result {
		admin: t_sc_admin;
		/** 归属上级(上级的用户名) 后台没有*/
		parent_name?: string | null;
		/** 店铺类型数量统计*/
		count_shop_type: ShopCount_item[];
		/** 已到期店铺及数量 ,授权失效数量,即将到期数量,订购未到期及数量*/
		count_shop_extra: ShopExtraCount;
}
