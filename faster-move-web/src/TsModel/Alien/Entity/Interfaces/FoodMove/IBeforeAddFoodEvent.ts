	/** 在经过系统的 MapToNewShopFood 后通过任务和商品信息重新设置商品信息
主要作用的是系统报了类目错误,必须一次性提交商品的情况下报错之后,没法根系统规则配合时,报错的信息会在调用AddFood 之前调用一次*/
	export interface IBeforeAddFoodEvent {
		// 接口成员由实现类定义
	}
