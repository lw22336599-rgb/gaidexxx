/**
 * 店铺类型枚举
 * 用于定义不同平台的店铺类型
 */
export enum ShopType {
  None = 0,
  美团 = 1,
  饿了么 = 2,
  美团闪购 = 3,
  美团医药 = 4,
  饿百零售 = 5,
  京东到家 = 6,
  抖店即时零售 = 7,
  饿了么官方 = 8
}

/**
 * 基础系统接口
 * 所有表都应继承的基础字段
 */
export interface BaseSys {
  /** 主键Id */
  id: string;

  /** 创建时间 */
  crtim?: Date;

  /** 更新时间 */
  uptim?: Date;

  /** 是否可用，true可用，false不可用 */
  avtag: boolean;

  /** 备注 */
  notes?: string;
}

/**
 * 店铺状态枚举
 */
export enum ShopState {
  /** 未知状态 */
  None = 0,
  店铺未登陆 = 1,
  店铺已登陆 = 2,
  店铺已掉线 = 3,
  店铺营业中 = 4,
  已暂停营业 = 5,
  店铺上线中 = 6,
  店铺已下线 = 7,
}

/**
 * 店铺列表接口
 */
export interface ShopListItem extends BaseSys {
  /** 店铺名称 */
  name: string;

  /** 店铺所在省份 */
  province?: string;

  /** 店铺所在城市 */
  city?: string;

  /** 创建用户 */
  user: string;

  /** 店铺类型 */
  shop_type: ShopType;

  /** 店铺用户名 */
  shop_user?: string;

  /** 店铺密码 */
  shop_pwd?: string;

  /** 平台的店铺id */
  office_id: string;

  /** cookies */
  cookies: string;

  /** 上次ck更新日期 */
  ck_uptime?: Date;

  /** 店铺状态 */
  state: ShopState;

  /** 店铺服务到期时间 */
  EndTime: Date;

  /** 店铺头像 */
  img: string;

  /** 店铺评分 */
  score: number;

  /** 有管理权限的用户id */
  MgAgencys: string[];

  /** 如果是分店即指向主店 */
  MainShop?: string;

  /** 当前工作的客户端 */
  client?: string;
}