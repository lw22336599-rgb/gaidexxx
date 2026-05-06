/**
 * 业务入口：`uni.request` 等统一使用 `config/http` 中的 `UNI_H5_PC_API_ORIGIN`（当前固定为 PC Vite :5200）。
 * dev-bridge（/seed、SSE）默认与 API 同主机、端口 3000，可通过 `VITE_UNI_FORCE_BRIDGE_BASE` 覆盖。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";

function envTrim(key: string): string {
  return String((import.meta.env as Record<string, string | undefined>)[key] || "").trim();
}

function stripSlash(s: string): string {
  return s.replace(/\/$/, "");
}

/** 与 API 同机的 dev-bridge；可单独设 `VITE_UNI_FORCE_BRIDGE_BASE` */
function forcedBridgeOrigin(): string | null {
  const b = envTrim("VITE_UNI_FORCE_BRIDGE_BASE");
  if (b) return stripSlash(b);
  return null;
}

/** faster-move-web（PC Vite，含 /admin 等 → proxy → bridge） */
export function resolvePcViteOrigin(): string {
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
