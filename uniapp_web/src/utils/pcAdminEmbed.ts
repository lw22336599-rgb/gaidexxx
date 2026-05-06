/**
 * H5 内嵌 faster-move-web（hash 路由）时的根地址与完整 URL。
 * 开发态手机：与 5173 同源 hostname 的 :5200，避免 env 写死 IP 导致 web-view 白屏。
 */
import { resolvePcAdminEmbedOrigin } from "@/utils/h5DevOrigins";

export function pcAdminOrigin(): string {
  return resolvePcAdminEmbedOrigin();
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
