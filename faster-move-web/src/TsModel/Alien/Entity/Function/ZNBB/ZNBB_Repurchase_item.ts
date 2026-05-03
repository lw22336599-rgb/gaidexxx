export interface ZNBB_Repurchase_item {
		/** 复购人数*/
		RepCount: number;
		/** 下单总人数*/
		OrdCount: number;
		/** 复购率*/
		RepRate: number;
		/** 同行前10% 复购率*/
		PeerRate_Top10: number;
		/** 商圈同行复购率*/
		PeerRate_Avg: number;
}
