import { ShopType } from '/@/types/shop'
import { ActivityType } from '/@/types/activity/ActivityType'
import { UserVistType } from '/@/types/activity/UserVistType'
import { DateTimeScope } from '/@/types/activity/DateTimeScope'
import { DayType } from '/@/types/activity/DayType'
import { TimeSpanScope } from '/@/types/activity/TimeSpanScope'
import { PickType } from '/@/types/activity/PickType'
import type {
  ActivityType_ZheKou,
  ActivityType_ZheKou_Item,
  ActivityType_ZheKou_SetType
} from '/@/types/activity/ActivityType_ZheKou'

export namespace FoodManageApi {
  // 基础请求参数
  export interface BaseParams {
    /** 此操作只针对数据库 操作完后统一更新到平台 */
    SyncSite: boolean
    /** 限制分组如为空代表所有分组 */
    GroupOffids: string[] | null
    /** 任务id */
    TaskId: string
    /** 店铺id */
    ShopId: string
  }

  // 获取商品列表参数
  export interface GetFoodListParams extends BaseParams {
    /** 页数 */
    Page: number
    /** 商品ID列表 如果为空就不限制 */
    FoodIds?: string[]
    /** 商品名 */
    ProductName?: string
    /** 最低价 */
    MinPrice?: number
    /** 最高价 */
    MaxPrice?: number
    /** 是否折扣 */
    IsDiscount?: boolean
    /** 是否上架 */
    IsOnSale?: boolean
    /** 商品标签类型（全部商品、售卖中、已下架、活动商品、多规格商品） */
    TabType?: ProductTabType
  }

  /** 商品标签类型 */
  export enum ProductTabType {
    /** 全部商品 */
    All = 0,
    /** 已售罄 */
    SoldOut = 1,
    /** 已下架 */
    OffShelf = 2,
    /** 活动商品 */
    IsDiscount = 3,
    /** 多规格商品 */
    MultiSpec = 4
  }

  // 批量修改图片参数
  export interface BatchUpdateImageParams extends BaseParams {
    type: 'addBorder' | 'removeBorder'
    borderColor?: string
    borderWidth?: number
  }

  // 批量删除商品参数
  export interface BatchDeleteFoodParams extends BaseParams {
    /** 第几页 */
    Page?: number
    /** 商品id列表 */
    FoodIds?: string[]
  }

  // 批量上下架参数
  export interface BatchUpdateStatusParams extends BaseParams {
    /** 商品ID列表 */
    FoodIds?: string[]
    /** 商品上下架状态 */
    IsOnSale: FoodStatusType
  }

  // 批量修改库存参数
  export interface BatchUpdateStockParams extends BaseParams {
    /** 要更新的商品和sku列表，如果为空则更新全部商品 */
    Targets?: UpdateSpuInSkuItem[]
    /** 调整方式 */
    AdjustType: AdjustTypeEnumStock
    /** 调整库存 */
    AdjustStock: number
  }

  /** 调整方式 */
  export enum AdjustTypeEnumStock {
    /** 上下浮动 */
    上下浮动 = 0,
    /** 固定数量 */
    固定数量 = 1
  }

  /** 折扣类型 */
  export enum DiscountTypeEnum {
    /** 折扣率 */
    折扣率 = 0,
    /** 折扣价 */
    折扣价 = 1
  }

  /** 限购类型 */
  export enum LimitTypeEnum {
    /** 不限 */
    不限 = 0,
    /** 限购 */
    限购 = 1
  }

  /** 调整方式 */
  export enum AdjustTypeEnum {
    /** 上下浮动 */
    上下浮动 = 0,
    /** 一口价 */
    一口价 = 1
  }

  /** 取整方式 */
  export enum RoundTypeEnum {
    /** 不改变 */
    不改变 = 0,
    /** 向上取整 */
    向上取整 = 1,
    /** 向下取整 */
    向下取整 = 2
  }

  // 批量修改折扣参数
  export interface BatchUpdateDiscountParams extends BaseParams {
    /** 要更新的商品和sku，如果为空则更新全部商品 */
    Targets?: UpdateSpuInSkuItem[]
    /** 折扣方式（如：折扣率、折扣价） */
    DiscountType: DiscountTypeEnum
    /** 调整方式（上下浮动/一口价） */
    AdjustType: AdjustTypeEnum
    /** 折扣价 */
    DiscountPrice?: number
    /** 折扣率 */
    DiscountRate?: number
    /** 每日库存限购类型 */
    DailyStockLimitType: LimitTypeEnum
    /** 每日库存限购数量 */
    DailyStockLimitCount?: number
    /** 每单限购类型 */
    OrderLimitType: LimitTypeEnum
    /** 每单限购数量 */
    OrderLimitCount?: number
    /** 活动名称 */
    ActivityName: string
    /** 活动开始时间 */
    StartTime: string
    /** 活动结束时间 */
    EndTime: string
    /** 取整方式 */
    RoundType: RoundTypeEnum
  }

  /**
   * 商品和SKU项
   */
  export interface UpdateSpuInSkuItem {
    /**
     * 商品的spu
     */
    Spu: string
    /**
     * 商品的sku id列表
     */
    SkuIds: string[]
  }

  // 批量下线折扣参数
  export interface BatchOfflineDiscountParams extends BaseParams {
    /**
     * 要更新的商品和sku，如果为空则更新全部商品
     */
    Targets?: UpdateSpuInSkuItem[]
  }

  // 批量修改起购数量参数
  export interface BatchUpdateMinBuyParams extends BaseParams {
    /** 要更新的商品和sku列表，如果为空则更新全部商品 */
    Targets?: UpdateSpuInSkuItem[]
    /** 调整方式 */
    AdjustType: AdjustTypeEnum
    /** 调整最小购买数 */
    AdjustMinBuy: number
  }

  // 批量修改商品名称参数
  export interface UpdateFoodNameParms extends BaseParams {
    /** 更改方式 */
    Mode: UpdateFoodNameMode
    /** 数据库中的商品id 非offid */
    FoodIds: string[]
    /** 前辍 */
    Prefix?: string
    /** 后辍 */
    Suffix?: string
    /** 原文字 */
    OriginalText?: string
    /** 替换文字 如果是完全重命名则是新的商品名 */
    ReplacementText?: string
  }

  /** 商品名称更新模式 */
  export enum UpdateFoodNameMode {
    添加前缀 = 1,
    添加后缀 = 2,
    替换文本 = 3,
    重命名 = 4
  }

  // 批量更新商品图片边框参数
  export interface BatchUpdateImageBorderParams extends BaseParams {
    /** 商品ID列表，为空则处理所有商品 */
    FoodIds?: string[]
    /** 图片边框链接 */
    BorderImageUrl: string
    /** 是否只设置主图（第一张图片）
     * true: 只设置主图
     * false: 设置所有图片
     */
    OnlyMainImage: boolean
  }

  /** 删除第一张主图参数 */
  export interface DeleteFirstFoodImageParams extends BaseParams {
    /** 要删除的商品id列表. 不传则删除全部商品的第一张主图 */
    FoodIds?: string[]
  }

  /** 恢复商品参数 */
  export interface RecoverFoodParams extends BaseParams {
    /** 要恢复的商品id列表. 不传则恢复全部商品 */
    FoodIds?: string[]
  }

  // 拉取商品数据参数
  export interface PullShopFoodsParams {
    taskId: string
    /*强制拉取*/
    forcedPull: boolean
  }

  /** 强制从平台重新拉取商品数据参数 */
  export interface PullShopFoodsV2Params {
    /** 任务ID */
    TaskId: string
    /** 是否删除所有商品数据 */
    IsDeleteAllFoods: boolean
  }

  // 商品分组
  export interface FoodGroup {
    id: string
    name: string
    parentId: string | null
    children?: FoodGroup[]
  }

  // 商品SKU
  export interface FoodSku {
    id: string
    name: string
    price: number
    stock: number
    discount: number
    minBuy: number
    status: boolean
  }

  // 商品信息
  export interface Food {
    id: string
    name: string
    price: number
    stock: number
    discount: number
    minBuy: number
    status: boolean
    image: string
    skus?: FoodSku[]
  }

  // 分页响应
  export interface PageResponse<T> {
    total: number
    items: T[]
  }

  // ---------- 通用返回类型 ----------
  // 通用接口响应结构
  export interface RestResult<T = any> {
    code: number
    msg: string
    data: T
    [key: string]: any
  }

  // 进度信息
  export interface ProgressInfo {
    /** 如果是每一步代表一个任务项完成,这里会返回任务项信息,可以是 id也可以是对像信息(json) */
    Item?: string
    /** 已经完成 */
    IsFinished: boolean
    /** IsFinished 为true 此项不为空表明任务执行失败了 且附加了信息 前端需要弹出来 */
    ExceptionMsg?: string
    /** 总数 */
    Total: number
    /** 进度 */
    Progress: number
    /** 错误消息 */
    ErrMsg?: string[]
  }

  // 分组VO
  export interface FoodGroupVoItem {
    id: string
    name: string
    parentId: string | null
    children?: FoodGroupVoItem[]
    Group?: {
      id: string
      Name: string
      OfficeId: string
      Code: string | null
      Index: number
      Icon: string | null
      Description: string
      FoodCount: number
      GroupType: number
      TopConf: any
      Children: any
      OtherValues: {
        img_url: string
      }
    }
    shop?: string
    shop_offid?: string
    office_id?: string
    spu_count?: number
    ParentOffId?: string | null
    Parent?: any
    AllParent?: any
    ExTime?: string
    crtim?: string
    uptim?: string | null
    avtag?: boolean
    notes?: string | null
    Children?: FoodGroupVoItem[]
  }

  // 分页响应
  export interface PageResultVo<T> {
    total: number
    items: T[]
    [key: string]: any
  }

  // 商品状态枚举
  export enum FoodStatusType {
    /** 无状态 */
    None = 0,
    /** 已上架 */
    已上架 = 1,
    /** 已下架 */
    已下架 = 2
  }

  // 规格类型枚举
  export enum SpecificationType {
    /** 普通规格组 */
    普通规格组 = 0
  }

  // 销售状态枚举
  export enum FoodSellStatusType {
    /** 无状态 */
    None = 0
  }

  // 计量单位枚举
  export enum UintType {
    /** 无单位 */
    None = 0
  }

  // 商品图片
  export interface FoodImage {
    /** 图片地址 */
    Img: string
    /** 是否为主图 */
    IsMaster: boolean
    /** 排序 从 0开始 */
    Index: number
    /** 其他信息 */
    OtherValues?: Record<string, string>
  }

  // 商品视频
  export interface FoodVideo {
    /** 视频图片地址 */
    Img?: string
    /** 视频地址 */
    VideoUrl: string
    /** 排序 从 0开始 */
    Index: number
    /** 其他信息 */
    OtherValues?: Record<string, string>
  }

  // 规格选项
  export interface FoodSpecificationOption {
    /** 规格选项id */
    id: string
    /** 规格组名 */
    SpecName: string
    /** 价格 */
    Price: number
    /** 选项名称 */
    Name: string
    /** 销售状态 */
    Status: FoodSellStatusType
    /** 计量值 */
    Weight: number
    /** 计量单位 */
    WeightType?: UintType
    /** SKU ID */
    SkuId: string
    /** 顺序 从0开始 */
    Index: number
    /** 其他信息 */
    OtherValues?: Record<string, string>
    /** 库存与打包费等 */
    SkuInfo?: FoodSkuItem
    /** 针对规格选项的最小购买数 */
    MinBuy?: number
    /** upc 条形码 */
    UpcCode?: string
  }

  // 商品规格
  export interface FoodSpecification {
    /** 规格组id */
    id: string
    /** 规格组类型 */
    SpecType: SpecificationType
    /** 规格名称，如：份量 */
    Name: string
    /** 顺序 */
    Index: number
    /** 选项 如 大份，小份 */
    Options: FoodSpecificationOption[]
    /** 其他信息 */
    OtherValues?: Record<string, string>
  }

  // 规格选项对应的规格信息
  export interface FoodSkuItemForSpecification {
    /** 规格组id */
    SpecId: string
    /** 规格组名 */
    SpecName: string
    /** 选项id */
    OptId: string
    /** 规格选项名 */
    OptionName: string
    /** 在规格第几层 */
    Level: number
    /** 对像的其他值 */
    OtherValues?: Record<string, string>
  }

  // 库存和打包费
  export interface FoodSkuItem {
    /** 由本系统为此sku创建的id */
    id: string
    /** sku价格 */
    Price: number
    /** 序号(从0开始) */
    Sequence: number
    /** 打包费 */
    BoxPrice: number
    /** 剩余库存 -1 无限库存 */
    Stock: number
    /** 最大库存 -1 无限库存 */
    MaxStock: number
    /** 自动补足 */
    AutoRefresh: boolean
    /** 状态 */
    Status: FoodSellStatusType
    /** 每多少个 Stock 用一个包装( 每多少份 ) */
    BoxNum: number
    /** sku 如 大份,加料.. 只做为比对用 默认是以逗号连接的 */
    SkuPath: string
    /** sku id */
    SkuId: string
    /** 商家系统中自己定义的ID */
    OuterId?: string
    /** 重量值 */
    Weight: number
    /** 重量单位 */
    WeightType: UintType
    /** 条形码 */
    Barcode?: string
    /** 货架码/位置 */
    ShelfNum?: string
    /** sku图片 */
    SkuImages?: FoodImage[]
    /** sku的其他值 */
    OtherValues?: Record<string, string>
    /** 起购数, 针对sku */
    MinBuy?: number
    /** 针对的规格名和属性等 */
    ForSpec: FoodSkuItemForSpecification[]
    /** 折扣活动 */
    Discount?: ActivityType_ZheKou
  }

  // 商品基础信息
  export interface FoodItemBase {
    /** 官方平台的商品id 也就是spuid */
    SpuId: string
    /** 商品名称 */
    Name: string
    /** 商品状态 */
    Status: FoodStatusType
    /** 商品描述 */
    Description: string
    /** 卖点(副标题) */
    SellingPoint?: string
    /** 商品图片列表 */
    ImageUrls?: FoodImage[]
    /** 商品视频列表 */
    FoodVideos?: FoodVideo[]
    /** 图片内容(针对零售) */
    PicContent?: FoodImage[]
    /** 商品类目 */
    Category?: {
      id: string
      name: string
      [key: string]: any
    }
    /** 最少起售数量 */
    MinBuyCount?: number
    /** 最多购买数量 */
    MaxBuyCount?: number
    /** 商品排序 */
    Index: number
    /** 最顶层规格组名称 */
    MasterSpec: string
    /** 是否按规格定价 */
    SpecPrice: boolean
    /** 规格列表 */
    Specifications?: FoodSpecification[]
    /** SKU列表 */
    SkuList?: FoodSkuItem[]
    /** 售卖时间范围 */
    SellDayScope?: {
      start: string
      end: string
    }
    /** 售卖时间 */
    SellTime?: {
      day: number
      timeRanges: {
        start: string
        end: string
      }[]
    }[]
    /** 商品标签 */
    FoodLables?: {
      name: string
      type: number
    }[]
    /** 套餐搭配-固定商品 */
    CombineFood?: {
      /** 份数 */
      Count?: number
      /** 商品名 */
      FoodName: string
      /** spu id */
      SpuId: string
      /** sku名 */
      SkuName: string
      /** skuid */
      SkuId: string
      /** 表明sku的层级 */
      SkuNamePath: string[]
    }[]
    /** 套餐搭配-分组可选套餐 */
    CombineGroupFood?: any[]
    /** 自定义套餐内容 */
    CombineCustomFood?: any[]
    /** 商品类型 */
    FoodType: number
    /** 其他值 */
    OtherValues?: Record<string, string>
    /** 售后支持 */
    AfterSale?: {
      [key: string]: any
    }
    /** 品牌 */
    BrandPrty?: {
      name: string
      value: string
      [key: string]: any
    }
    /** 特殊属性 */
    SpecialAttrs?: {
      name: string
      value: string
      [key: string]: any
    }[]
    /** 商品自定义的属性 */
    MyProperties?: {
      name: string
      value: string
      [key: string]: any
    }[]
  }

  // 商品VO
  export interface FoodItemVo extends FoodItemBase {
    /** 商品ID */
    id: string
    /** 商品属性1 */
    Properties1?: {
      name: string
      value: string
    }[]
    /** 商品属性2 */
    Properties2?: {
      namePath: string[]
      value: string
    }[]
    /** 多分组官方ID */
    GroupMultipOffId?: string[]
    /** 复制任务信息 */
    CopyTask?: {
      id: string
      status: number
      errorMsg?: string
    }
  }

  // 店铺信息
  export interface ShopInfo {
    id: string
    name: string
    officeId: string
    shopType: number
    [key: string]: any
  }

  // 使用类型别名
  export type DiscountActivity = ActivityType_ZheKou
  export type DiscountActivityItem = ActivityType_ZheKou_Item
  export type DiscountActivitySetType = ActivityType_ZheKou_SetType

  export interface UpdateFoodPriceParms {
    TaskId: string
    ShopId: string
    SyncSite: boolean
    GroupOffids: string[] | null
    /** 要更新的商品和sku列表，如果为空则更新全部商品 */
    Targets?: UpdateSpuInSkuItem[]
    /** 调整方式 */
    ChangeType: ChangePriceTypeEnum
    /** 调整值,正数表示上调,负数表示下调 */
    Value: number
  }

  /** 调整方式 */
  export enum ChangePriceTypeEnum {
    /** 上下浮动 */
    上下浮动 = 0,
    /** 固定价格 */
    固定价格 = 1,
    /** 百分比浮动 */
    百分比浮动 = 2
  }
}
