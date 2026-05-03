/** 满减具体活动项*/
export interface ActivityCargeItem {
		/** 满值(达到这个值就减掉 chargeSortIndex 的金额)*/
		OriginPrice: number;
		/** 减多少*/
		PoiCharge: number;
		/** 满减阶梯1 满减阶梯2 满减阶梯3 这样的也就是阶梯索引*/
		Index: number;
}
