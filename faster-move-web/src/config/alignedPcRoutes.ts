/**
 * 与 uni-app H5 `uniapp_web/src/config/alignedPcRoutes.ts` 保持字符串一致（hash 段）。
 * PC 侧 `router.push`、引导跳转请优先使用本常量，避免与手机内嵌 WebView 路径不一致。
 */
export const ALIGNED_PC_HASH = {
  HOME: '/index',
  PORTAL: '/portal',
  SHOP_V2_FUNCTIONAL: '/shop-v2/functional',
  SHOP_V2_MT_SHOP: '/shop-v2/feature/type=mt-shop-feature',
  SHOP_V2_ELM: '/shop-v2/feature/type=elm-feature',
  SHOP_V2_JD: '/shop-v2/feature/type=jd-home-feature',
  SHOP_V2_DY: '/shop-v2/feature/type=dy-retail-feature',
  SHOP_V2_MT_MED: '/shop-v2/feature/type=mt-medicine-feature',
  SHOP_WECHAT_TS: '/shopwechat/tswechat',
  /** 与后台「个人中心」菜单路径一致 */
  SETTING_PERSONAL_CENTER: '/setting/personalCenter',
  TEAM_POINT: '/team/point',
  TEAM_MEMBER: '/team/member',
  USER_OPERATE_TODOS: '/user-operate/todos',
  DATA_SCREEN: '/dataScreen',
  VIDEO: '/other/video',
  CUSTOM_TABLE: '/vab/table/customTable',
  ECHARTS: '/other/echarts'
} as const

export function shopV2HashForPlatform(platform?: string): string {
  const p = String(platform || '')
  if (p === 'mt-shop-feature') return ALIGNED_PC_HASH.SHOP_V2_MT_SHOP
  if (p === 'elm-shop-feature') return ALIGNED_PC_HASH.SHOP_V2_ELM
  if (p === 'jd-shop-feature') return ALIGNED_PC_HASH.SHOP_V2_JD
  if (p === 'dy-retail-feature') return ALIGNED_PC_HASH.SHOP_V2_DY
  if (p === 'mt-medicine-feature') return ALIGNED_PC_HASH.SHOP_V2_MT_MED
  return ALIGNED_PC_HASH.SHOP_V2_FUNCTIONAL
}
