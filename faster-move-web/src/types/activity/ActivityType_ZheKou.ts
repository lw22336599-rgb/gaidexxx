import { ActivityType } from './ActivityType';
import { UserVistType } from './UserVistType';
import { DateTimeScope } from './DateTimeScope';
import { DayType } from './DayType';
import { TimeSpanScope } from './TimeSpanScope';
import { PickType } from './PickType';

/**
 * 折扣活动设置类型
 */
export enum ActivityType_ZheKou_SetType {
  None = 0,
  按折扣 = 1,
  按折后价 = 2,
}

/**
 * 折扣活动商品项
 */
export interface ActivityType_ZheKou_Item {
  /** 商品id */
  SpuId: string;
  /** 商品规格属性id */
  SkuId: string;
  /** 优惠设置方式  按折扣=0, 按折后价=1 */
  SettingType: ActivityType_ZheKou_SetType;
  /** 限购份数 */
  OrderLimit: number;
  /** 库存份数 */
  DayLimit: number;
  /** 零售可能有 活动期间，该活动商品每个门店总共可售卖的数量 */
  Stock?: number;
  /** 折扣 如 9.8折 就是 9.8 */
  Discount: number;
  /** 原价 */
  OriginPrice: number;
  /** 拆后价格。 如果以 Discount 去算会有精度问题，要尽量以这个来设置 设置时会优先以这个为准 */
  ActPrice?: number;
  /** 商家承担 可能没有值 ，美团有 */
  PoiCharge?: number;
  /** sku 名称 也就是选项名称 */
  SkuName?: string;
  /** 选项路径 */
  SpecPath?: string[];
  /** 其他参数,如饿了么可能会有多个id等情况 */
  OtherValues?: Record<string, string>;
}

/**
 * 折扣活动
 */
export interface ActivityType_ZheKou {
  /** 活动类型 */
  ActType: ActivityType;
  /** 活动面向客户 */
  ForUserType: UserVistType;
  /** 活动官方id */
  OffId?: string;
  /** 活动时间范围 */
  TimeScope: DateTimeScope;
  /** 活动在哪些天有效 */
  DayTypes?: DayType[];
  /** 时段 在一天中这些时段活动有效 */
  Period?: TimeSpanScope[];
  /** 活动到期自动延时30天 */
  AuToMonth: boolean;
  /** 其他参数,如饿了么可能会有多个id等情况 */
  OtherValues?: Record<string, string>;
  /** 美团提示的是否覆盖原有活动配置,直接为true好了 */
  OverConf: boolean;
  /** 活动仅限的取货方式 */
  PickType: PickType;
  /** 折扣商品 */
  FoodItems: ActivityType_ZheKou_Item[];
}