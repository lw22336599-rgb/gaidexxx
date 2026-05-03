export interface AutoOutOrderConf_slow {
		/** 每N秒,限制出多少餐*/
		Second: number;
		/** 最大出餐订单量 小于1 将不限制*/
		MaxOut: number;
}
