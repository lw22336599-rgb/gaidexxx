import {ForUserType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ForUserType";

export interface ActivityType_Jue_Item {
		/** 卷金额 商品卷不会有卷金额*/
		JueValue?: number | null;
		/** 卷使用门槛（订单金额大于等于这个值）*/
		LimitPrice: number;
		/** 卷有效期*/
		UseDay: number;
		/** 针对的客户群体*/
		UserType?: ForUserType | null;
}
