import { resolvePcViteOrigin } from "@/utils/h5DevOrigins";

/**
 * 将后端返回的相对头像/资源路径补全为可访问 URL（与当前 H5 访问主机上的 PC Vite 同源）。
 */
export function resolveMediaUrl(path: string | undefined | null): string {
  const p = String(path ?? "").trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p) || p.startsWith("data:") || p.startsWith("blob:")) return p;
  const base = resolvePcViteOrigin();
  if (p.startsWith("/")) return `${base}${p}`;
  return `${base}/${p}`;
}
