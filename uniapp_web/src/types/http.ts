/** 与 PC 端常见响应体 `{ code, data, msg }` 对齐（字段名以 config 为准） */
export interface ApiEnvelope<T = unknown> {
  code?: number | string;
  data?: T;
  msg?: string;
  [key: string]: unknown;
}
