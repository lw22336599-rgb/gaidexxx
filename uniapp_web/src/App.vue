<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { setupRouteGuard } from "@/router/guard";
import "@/styles/pc-shell-media.css";
import "@/styles/tabbar-unify-h5.css";

/**
 * H5 可选：整站直接进入 faster-move-web（与 PC 浏览器完全一致）。
 * 需在 .env 设置 VITE_H5_ENTRY_PC=true 且配置 VITE_PC_ADMIN_ORIGIN。
 * 说明：不存在 pages/pc 可拷贝；PC 源码在 faster-move-web/src/views，无法不经改造塞进 uni-app。
 */
onLaunch(() => {
  // #ifdef H5
  if (String(import.meta.env.VITE_H5_ENTRY_PC || "").toLowerCase() === "true") {
    const origin = String(import.meta.env.VITE_PC_ADMIN_ORIGIN || "")
      .trim()
      .replace(/\/$/, "");
    if (typeof window !== "undefined" && origin) {
      const hash = String(import.meta.env.VITE_H5_ENTRY_PC_HASH || "/index").trim();
      const path = hash.startsWith("/") ? hash : `/${hash}`;
      window.location.replace(`${origin}/#${path}`);
      return;
    }
  }
  /** 开发联调：尽力清掉本域 Service Worker / CacheStorage，避免手机仍用旧 HTML/CSS */
  if (import.meta.env.DEV) {
    const flag = "__h5_dev_sw_cleared";
    try {
      if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, "1");
        if ("serviceWorker" in navigator) {
          void navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => void r.unregister()));
        }
        if (typeof caches !== "undefined") {
          void caches.keys().then((ks) => ks.forEach((k) => void caches.delete(k)));
        }
      }
    } catch {
      /* ignore */
    }
  }
  // #endif
  setupRouteGuard();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* #ifdef H5 */
/* 首页等内容区用 height:100% 填满导航与 tabBar 之间区域，便于内部独立滚动 */
html,
body,
uni-app,
uni-page,
uni-page-wrapper,
uni-page-body {
  height: 100%;
}
uni-page-body {
  box-sizing: border-box;
  min-height: 0;
}
/* #endif */
</style>
