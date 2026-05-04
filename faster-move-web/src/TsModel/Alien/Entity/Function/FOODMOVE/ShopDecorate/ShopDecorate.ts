import type { ShopTop } from '@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopTop'
import type { ShopWindow } from '@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopWindow'
import type { BossRecommend } from '@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/BossRecommend'
import type { ShopPoster } from '@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopPoster'

/** 店铺装修对像*/
export interface ShopDecorate {
  /** 店铺招牌*/
  Top?: ShopTop | null
  /** 商品橱窗*/
  ShopWindow?: ShopWindow[] | null
  /** 老板推荐 饿了么不支持*/
  BossRecommend: BossRecommend
  /** 菜单海报*/
  Poster?: ShopPoster[] | null
}
