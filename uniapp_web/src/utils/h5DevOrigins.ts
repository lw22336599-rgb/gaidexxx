/**
 * 业务入口：`uni.request` 与 PC faster-move-web（:5200）对齐。
 * 基址统一为 `VITE_UNI_FORCE_API_BASE` → `config/http` 常量（联调默认 http://10.10.10.177:5200）。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";

function envApiBase(): string {
  return String(import.meta.env.VITE_UNI_FORCE_API_BASE || "").trim().replace(/\/$/, "");
}

/** faster-move-web 根地址，无尾斜杠 */
export function resolvePcViteOrigin(): string {
  const fromEnv = envApiBase();
  if (fromEnv) return fromEnv;
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}

/** 与 resolvePcViteOrigin 相同；历史命名保留，供 /seed、SSE 等与 API 同源 */
export function resolveBridgeOrigin(): string {
  return resolvePcViteOrigin();
}

/** 内嵌 PC 后台（hash）根地址 */
export function resolvePcAdminEmbedOrigin(): string {
  const fromEnv = String(import.meta.env.VITE_PC_ADMIN_ORIGIN || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}
