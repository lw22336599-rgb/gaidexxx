import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";

/** 店铺状态变更VO*/
export interface ShopStatusChangeVO {
		/** 平台店铺ID*/
		SiteShopId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 原状态*/
		OldStatus?: ShopState | null;
		/** 新状态*/
		NewStatus?: ShopState | null;
		/** 状态变更时间*/
		ChangeTime: Date;
		/** 变更原因*/
		ChangeReason?: string | null;
		/** 其他变更信息*/
		AdditionalInfo?: string | null;
}
