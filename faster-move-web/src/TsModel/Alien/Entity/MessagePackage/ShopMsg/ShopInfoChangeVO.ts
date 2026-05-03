import {ShopChangeField} from "@/TsModel/Alien/Entity/Enums/ShopChangeField";

/** 店铺信息变更VO*/
export interface ShopInfoChangeVO {
		/** 平台店铺ID*/
		SiteShopId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 原值*/
		OldValue?: string | null;
		/** 新值*/
		NewValue?: string | null;
		/** 变更时间*/
		ChangeTime: Date;
		/** 变更原因*/
		ChangeReason?: string | null;
		/** 其他变更信息*/
		AdditionalInfo?: string | null;
		ChangeField: ShopChangeField;
}
