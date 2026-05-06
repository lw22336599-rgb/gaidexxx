/**
 * 业务入口：`uni.request` 与 PC faster-move-web（:5200）对齐。
 * H5 开发：手机用「本机局域网 IP:5173」打开时，必须用当前页 origin 走 uni-app 的 Vite 代理（/admin、/seed 等），
 * 禁止写死 10.10.10.177（手机常不可达）。
 * 小程序/App：无 window，仍用 env 或 `UNI_H5_PC_API_ORIGIN`。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";

function envApiBase(): string {
  return String(import.meta.env.VITE_UNI_FORCE_API_BASE || "").trim().replace(/\/$/, "");
}

/** faster-move-web（或当前 H5 开发服务器）根地址，无尾斜杠 */
export function resolvePcViteOrigin(): string {
  if (import.meta.env.DEV && typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  const fromEnv = envApiBase();
  if (fromEnv) return fromEnv;
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}

/** 与 resolvePcViteOrigin 相同；历史命名保留，供 /seed、SSE 等与 API 同源 */
export function resolveBridgeOrigin(): string {
  return resolvePcViteOrigin();
}

/**
 * 内嵌 PC 后台（hash）根地址：H5 开发时用当前页 hostname + :5200，与手机访问 5173 时同网段。
 */
export function resolvePcAdminEmbedOrigin(): string {
  if (import.meta.env.DEV && typeof window !== "undefined" && window.location?.hostname) {
    const proto = window.location.protocol === "https:" ? "https:" : "http:";
    return `${proto}//${window.location.hostname}:5200`.replace(/\/$/, "");
  }
  const fromEnv = String(import.meta.env.VITE_PC_ADMIN_ORIGIN || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}
