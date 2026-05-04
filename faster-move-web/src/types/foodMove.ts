export enum CreateTaskTypeEnum {
  None = 0,
  OldToNew = 1, // 老到新复制
  Competitor = 2, // 竞对复制
  BatchManage = 3 // 商品批量管理
}

// 商品搬家基础配置
export interface FoodMoveConfBase {
  /** 同步库存,如果为false 新店数据库存全部为99999 */
  SyncStock: boolean
  /** 同步老店的上下架状态 如果为false 哪到到新店的商品将全部为下架状态 */
  SyncOnSale: boolean
  /** 商品类目用推荐模式 */
  CategoryUseRecomend: boolean
  /** 属性推荐 */
  attr_recomend?: boolean
  /** 属性推荐最小相似度 */
  attr_recomend_s?: number
  /** 是否智能去水印 */
  RemoveWaterMark: boolean
  /** 其他设置.非通用 如平台的 */
  OtherConf?: string
}

// 商品搬家任务创建参数
export interface FoodMoveConf extends FoodMoveConfBase {
  /** 如果没有就是竞对复制  t_wmt_shop_list.id */
  OldShop?: string
  /** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址） */
  OldShopOffid?: string
  /** 店铺类型（ShopType 枚举） */
  OldShopType?: number
  /** 竞对店铺时为店铺取个名 */
  OldShopName?: string
  /** 新店 t_wmt_shop_list.id */
  NewShop: string
  /** 保留新店内的商品
   * 如果为true 哪新店不会删除任何东西,老店相同的分类将合并
   */
  KeepNewShops: boolean
  /** 同步活动列表 */
  SyncActivitys: boolean
  /** 仅同步这些活动 如果为空就是全部活动 */
  OnlyActivitys?: number[]
  /** 最大线程数 */
  MaxThreads: number
  /** 任务类型 */
  TaskType: CreateTaskTypeEnum
  /** 是否同步站点 */
  syncSite: boolean
}
