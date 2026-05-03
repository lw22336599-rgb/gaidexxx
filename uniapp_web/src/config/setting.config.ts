/**
 * 与 `faster-move-web/src/config/setting.config.ts` 对齐的登录/白名单相关项（仅同步 H5 所需子集）
 */
export const tokenTableName = "shop-vite-token";
export const tokenName = "token";

/** PC 为 history path；uni-app 为 pages 路径 */
export const routesWhiteList = [
  "/pages/login/login",
  "/pages/login/login/",
];

export const loginInterception = true;
export const loginRSA = false;
