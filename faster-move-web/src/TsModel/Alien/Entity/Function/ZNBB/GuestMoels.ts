export interface GuestMoels {
		/** 曝光人数*/
		Exposed: number;
		/** 进店人数*/
		Entered: number;
		/** 下单人数*/
		Ordered: number;
		/** 同行前10% 曝光人数*/
		PeersExposed_top10: number;
		/** 同行曝光人数 商圈同行平均值*/
		PeersExposed_avg: number;
		/** 同行前10% 进店人数*/
		PeersEntered_top10: number;
		/** 同行前10% 下单人数*/
		PeersOrdered_top10: number;
		/** 同行前10%进店人数 商圈同行平均值*/
		PeersEntered_avg: number;
		/** 同行平均下单人数*/
		PeersOrdered_avg: number;
		/** 进店率 //入店转化率 = 入店人数 / 曝光人数*/
		InRate: number;
		/** 下单转化率 = 下单人数 / 入店人数*/
		OrderRate: number;
		/** 同行前10%-进店率*/
		Peer_InRate: number;
		/** 同行10%下单转化率 = 下单人数 / 入店人数*/
		Peer_OrderdRate: number;
}
