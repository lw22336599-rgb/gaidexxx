/**
 * 取货方式
 */
export enum PickType {
  /** 无 */
  None = 0,
  /** 外卖和到店自取 */
  DeliveryAndSelfPickup = 1,
  /** 仅到店自取 */
  SelfPickup = 2,
}