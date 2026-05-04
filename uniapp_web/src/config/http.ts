/**
 * 与 PC 端 `faster-move-web/src/config/net.config.ts` 对齐的字段约定（便于共用后端契约）
 * 业务接口请勿写在本文件；仅放网络层常量。
 */
export const netConfig = {
  contentType: "application/json;charset=UTF-8",
  /** 单次请求最长等待（ms），与 PC dev 代理链路上限对齐 */
  timeout: 30000,
  successCode: [200, 0, "200", "0"] as const,
  statusName: "code",
  messageName: "msg",
} as const;

export type NetConfig = typeof netConfig;

/**
 * 手机 H5：业务请求与 PC 端 Vite（faster-move-web）同源，与门店/微信推送 Tab 内嵌一致。
 * 硬编码避免真机或缓存环境下 .env 未生效、5173 代理链错指向导致的 404。
 */
export const UNI_H5_PC_API_ORIGIN = "http://10.10.10.177:5200";
