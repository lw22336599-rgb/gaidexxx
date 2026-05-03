/**
 * 与 PC 端 `faster-move-web/src/config/net.config.ts` 对齐的字段约定（便于共用后端契约）
 * 业务接口请勿写在本文件；仅放网络层常量。
 */
export const netConfig = {
  contentType: "application/json;charset=UTF-8",
  timeout: 10000,
  successCode: [200, 0, "200", "0"] as const,
  statusName: "code",
  messageName: "msg",
} as const;

export type NetConfig = typeof netConfig;
