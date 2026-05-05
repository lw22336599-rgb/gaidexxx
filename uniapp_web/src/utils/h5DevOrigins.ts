/**
 * H5 业务入口：
 * - 若设 `VITE_UNI_FORCE_API_BASE`（如 http://10.10.10.177:5200），所有 uni.request 固定经该 PC Vite，
 *   再按原规则转发到 bridge/上游（与 PC 浏览器 axios 走同源代理一致）。
 * - 未设置时：用当前页 `hostname:5200` / `:3000`（便于 0.0.0.0 多网卡本机调试）。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";

function envTrim(key: string): string {
  return String((import.meta.env as Record<string, string | undefined>)[key] || "").trim();
}

function stripSlash(s: string): string {
  return s.replace(/\/$/, "");
}

function withPort(host: string, port: number): string {
  const proto =
    typeof window !== "undefined" && window.location?.protocol ? window.location.protocol : "http:";
  return `${proto}//${host}:${port}`.replace(/\/$/, "");
}

/** 开发环境强制 API 网关（PC faster-move-web Vite） */
function forcedApiOrigin(): string | null {
  const v = envTrim("VITE_UNI_FORCE_API_BASE");
  if (!v) return null;
  return stripSlash(v);
}

/** 与强制 API 同机的 dev-bridge；可单独设 `VITE_UNI_FORCE_BRIDGE_BASE` */
function forcedBridgeOrigin(): string | null {
  const b = envTrim("VITE_UNI_FORCE_BRIDGE_BASE");
  if (b) return stripSlash(b);
  const api = forcedApiOrigin();
  if (!api) return null;
  try {
    const u = new URL(api.includes("://") ? api : `http://${api}`);
    u.port = "3000";
    return stripSlash(u.origin);
  } catch {
    return null;
  }
}

/** faster-move-web（PC Vite，含 /admin 等 → proxy → bridge） */
export function resolvePcViteOrigin(): string {
  const forced = forcedApiOrigin();
  if (forced) return forced;
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}

/** api-dev-bridge（SSE /seed 等） */
export function resolveBridgeOrigin(): string {
  const forced = forcedBridgeOrigin();
  if (forced) return forced;
  try {
    const api = stripSlash(UNI_H5_PC_API_ORIGIN);
    const u = new URL(api.includes("://") ? api : `http://${api}`);
    u.port = "3000";
    return stripSlash(u.origin);
  } catch {
    return "http://10.10.10.177:3000";
  }
}
