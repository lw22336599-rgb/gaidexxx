import {ShopTop} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopTop";
import {ShopWindow} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopWindow";
import {BossRecommend} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/BossRecommend";
import {ShopPoster} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopPoster";

/** 店铺装修对像*/
export interface ShopDecorate {
		/** 店铺招牌*/
		Top?: ShopTop | null;
		/** 商品橱窗*/
		ShopWindow?: ShopWindow[] | null;
		/** 老板推荐 饿了么不支持*/
		BossRecommend: BossRecommend;
		/** 菜单海报*/
		Poster?: ShopPoster[] | null;
}
