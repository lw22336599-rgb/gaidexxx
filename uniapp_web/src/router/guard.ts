/**
 * 对齐 faster-move-web `src/router/permissions.ts` 的「需登录」语义（uni-app 无 vue-router，用拦截器 + 页面内兜底）
 */
import { loginInterception, routesWhiteList } from "@/config/setting.config";
import { getToken } from "@/utils/token";

function stripQuery(url: string) {
  return url.split("?")[0];
}

function isWhiteListPath(path: string): boolean {
  const p = stripQuery(path);
  return routesWhiteList.some((w) => p === w || p === `${w}/` || p.endsWith(w));
}

function shouldBlock(url: string): boolean {
  if (!loginInterception) return false;
  const path = stripQuery(url);
  if (!getToken() && !isWhiteListPath(path)) return true;
  return false;
}

function interceptNavigate(method: "navigateTo" | "redirectTo" | "reLaunch" | "switchTab") {
  uni.addInterceptor(method, {
    invoke(options) {
      const url = (options as { url?: string }).url;
      if (!url) return true;
      if (shouldBlock(url)) {
        uni.showToast({ title: "请先登录", icon: "none" });
        uni.redirectTo({ url: "/pages/login/login" });
        return false;
      }
      return true;
    },
  });
}

export function setupRouteGuard() {
  interceptNavigate("navigateTo");
  interceptNavigate("redirectTo");
  interceptNavigate("reLaunch");
  interceptNavigate("switchTab");
}

/** 各 tab 页 onShow 可调用，处理直开首页等场景 */
export function assertAuthedOrRedirectLogin(): boolean {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1];
  const route = cur ? `/${cur.route}` : "";
  if (!loginInterception) return true;
  if (getToken()) return true;
  if (isWhiteListPath(route)) return true;
  uni.redirectTo({ url: "/pages/login/login" });
  return false;
}
