/**
 * 与 faster-move-web 一致的 **hash 路径**（`#/…` 段，不含域名）。
 * 两端跳转、内嵌 WebView 必须引用此文件，避免前缀漂移。
 *
 * 对应 PC：`faster-move-web/src/config/alignedPcRoutes.ts`（内容需保持同步）
 */
export const ALIGNED_PC_HASH = {
  HOME: "/index",
  PORTAL: "/portal",
  /** Tab：门店管理默认页 */
  SHOP_V2_FUNCTIONAL: "/shop-v2/functional",
  SHOP_V2_MT_SHOP: "/shop-v2/feature/type=mt-shop-feature",
  SHOP_V2_ELM: "/shop-v2/feature/type=elm-feature",
  SHOP_V2_JD: "/shop-v2/feature/type=jd-home-feature",
  SHOP_V2_DY: "/shop-v2/feature/type=dy-retail-feature",
  SHOP_V2_MT_MED: "/shop-v2/feature/type=mt-medicine-feature",
  SHOP_WECHAT_TS: "/shopwechat/tswechat",
  /** 与 PC 个人中心路由一致（来自后台菜单 / 动态路由） */
  SETTING_PERSONAL_CENTER: "/setting/personalCenter",
  TEAM_POINT: "/team/point",
  TEAM_MEMBER: "/team/member",
  TEAM_GROUP: "/team/group",
  USER_OPERATE_TODOS: "/user-operate/todos",
  /** 聚合客服 / IM 客服聊天（与 PC customer-service 子路由一致） */
  CUSTOMER_SERVICE_CHAT: "/customer-service/chat",
  DATA_SCREEN: "/dataScreen",
  VIDEO: "/other/video",
  CUSTOM_TABLE: "/vab/table/customTable",
  ECHARTS: "/other/echarts",
} as const;

/** 首页 KPI 门店类：与 PC `shopV2PathForPlatform` 完全一致 */
export function shopV2HashForPlatform(platform?: string): string {
  const p = String(platform || "");
  if (p === "mt-shop-feature") return ALIGNED_PC_HASH.SHOP_V2_MT_SHOP;
  if (p === "elm-shop-feature") return ALIGNED_PC_HASH.SHOP_V2_ELM;
  if (p === "jd-shop-feature") return ALIGNED_PC_HASH.SHOP_V2_JD;
  if (p === "dy-retail-feature") return ALIGNED_PC_HASH.SHOP_V2_DY;
  if (p === "mt-medicine-feature") return ALIGNED_PC_HASH.SHOP_V2_MT_MED;
  return ALIGNED_PC_HASH.SHOP_V2_FUNCTIONAL;
}
