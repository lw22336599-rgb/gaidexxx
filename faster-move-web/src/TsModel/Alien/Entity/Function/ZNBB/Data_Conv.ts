/** 转化相关*/
export interface Data_Conv {
		/** 昨日总曝光人数*/
		YdayTraffic: number;
		/** 昨日有效订单数量*/
		YdayOrderNum: number;
		/** 昨日进店率*/
		YdayInRate: number;
		/** 昨日下单率*/
		YdayOrdRate: number;
		/** 新客进店率*/
		NewCusInRate: number;
		/** 新客下单率*/
		NewCusOrdRate: number;
		/** 老客进店率*/
		OldCusInRate: number;
		/** 老客下单率*/
		OldCusOrdRate: number;
		/** 商圈同行前10进店率*/
		PeerTop10InRate: number;
		/** 商圈同行前10下单率*/
		PeerTop10OrdRate: number;
}
