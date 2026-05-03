import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 获取店铺列表参数*/
export interface GetShopListParmsVo {
		/** 是否已关联分组*/
		hasGroup: boolean;
		/** 分页*/
		page: number;
		/** 分页大小*/
		pageSize: number;
		/** 过滤已到期或从未订购的门店*/
		filter_end: boolean;
		/** 过滤店铺类型(空测不过滤)*/
		shop_type?: ShopType | null;
		/** 过滤城市,支持多个(空则不过滤)*/
		shop_city?: string[] | null;
		/** 过滤关键词(店铺名称,门店id)*/
		word?: string | null;
}
