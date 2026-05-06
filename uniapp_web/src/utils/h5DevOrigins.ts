/**
 * 业务入口：`uni.request` 统一走 `config/http` 的 `UNI_H5_PC_API_ORIGIN`（PC faster-move-web :5200）。
 * `/admin`、`/homedata`、`/seed` 等均由 PC Vite 代理到 api-dev-bridge，手机端禁止直连 :3000（易出 request:fail）。
 */
import { UNI_H5_PC_API_ORIGIN } from "@/config/http";

/** faster-move-web（PC Vite）根地址，无尾斜杠 */
export function resolvePcViteOrigin(): string {
  return UNI_H5_PC_API_ORIGIN.replace(/\/$/, "");
}

/** 与 resolvePcViteOrigin 相同；历史命名保留，供 /seed、SSE 等与 API 同源 */
export function resolveBridgeOrigin(): string {
  return resolvePcViteOrigin();
}
