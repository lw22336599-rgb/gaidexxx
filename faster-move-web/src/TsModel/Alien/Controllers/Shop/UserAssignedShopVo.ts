import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";

/** 用户已分配的店铺信息*/
export interface UserAssignedShopVo {
		/** 店铺ID*/
		ShopId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 店铺Office ID*/
		ShopOfficeId: string;
		/** 店铺类型*/
		ShopType: ShopType;
		/** 城市*/
		City: string;
		/** 省份*/
		Province: string;
		/** 店铺状态*/
		State: ShopState;
		/** 分配时间*/
		AssignedAt?: Date | null;
		/** 分组名称*/
		GroupName?: string | null;
}
