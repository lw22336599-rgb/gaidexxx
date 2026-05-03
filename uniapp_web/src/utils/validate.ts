/** 与 faster-move-web 校验工具同名函数对齐（最小实现） */
export function isString(val: unknown): val is string {
  return typeof val === "string";
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}
