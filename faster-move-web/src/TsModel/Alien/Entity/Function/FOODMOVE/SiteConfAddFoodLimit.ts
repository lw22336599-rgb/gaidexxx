/** 对于网站限制添加商品速度的高级版本*/
export interface SiteConfAddFoodLimit {
		/** 分批处理 大于0时有效*/
		InBatches: number;
		/** 分批之后等多少秒后再复制*/
		BatchAfterWaitSec: number;
}
