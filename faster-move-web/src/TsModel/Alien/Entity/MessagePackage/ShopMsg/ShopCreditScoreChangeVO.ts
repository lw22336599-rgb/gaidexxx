import {CreditScoreChangeType} from "@/TsModel/Alien/Entity/MessagePackage/ShopMsg/CreditScoreChangeType";

/** 店铺信用分变更VO*/
export interface ShopCreditScoreChangeVO {
		/** 平台店铺ID*/
		SiteShopId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 变更类型*/
		ChangeType: CreditScoreChangeType;
		/** 原信用分*/
		OldScore?: number | null;
		/** 新信用分*/
		NewScore?: number | null;
		/** 扣分/加分*/
		ScoreChange: number;
		/** 变更时间*/
		ChangeTime: Date;
		/** 变更原因*/
		ChangeReason?: string | null;
		/** 处罚详情*/
		PenaltyDetails?: string | null;
		/** 处罚生效时间*/
		PenaltyEffectiveTime?: Date | null;
		/** 处罚结束时间*/
		PenaltyEndTime?: Date | null;
		/** 其他信息*/
		AdditionalInfo?: string | null;
}
