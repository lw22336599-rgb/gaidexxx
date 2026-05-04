/**
 * H5 内嵌 faster-move-web（hash 路由）时的根地址与完整 URL。
 * 优先 .env 的 VITE_PC_ADMIN_ORIGIN；否则与当前页主机:5200 一致（与 request 基址对齐）。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";
import { resolvePcViteOrigin } from "@/utils/h5DevOrigins";

export function pcAdminOrigin(): string {
  const fromEnv = String(import.meta.env.VITE_PC_ADMIN_ORIGIN || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return resolvePcViteOrigin();
  }
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}

/** PC 为 hash 路由：{origin}/#/shop-v2/functional */
export function buildPcAdminEmbedUrl(hashPath: string): string {
  const origin = pcAdminOrigin();
  let p = (hashPath || "/index").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  return `${origin}/#${p}`;
}

/** 在 origin 段追加查询参数，强制 web-view 整页重载（不走缓存） */
export function withPcAdminLoadBust(fullHashUrl: string, bustKey: number): string {
  if (bustKey <= 0) return fullHashUrl;
  const hashIdx = fullHashUrl.indexOf("#");
  if (hashIdx === -1) {
    return `${fullHashUrl}${fullHashUrl.includes("?") ? "&" : "?"}_wv=${bustKey}`;
  }
  const originPart = fullHashUrl.slice(0, hashIdx);
  const hashPart = fullHashUrl.slice(hashIdx);
  const sep = originPart.includes("?") ? "&" : "?";
  return `${originPart}${sep}_wv=${bustKey}${hashPart}`;
}
