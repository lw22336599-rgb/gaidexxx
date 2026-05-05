/** 个人中心「美团餐饮 / 京东到家」数量：由 homedata.last_week 最后一条推导（与 PC 周报表同源字段） */
const STORAGE_KEY = "mineShopPlatformCounts";

export function syncMineShopStatsFromHomedata(data: Record<string, unknown> | null | undefined): void {
  try {
    const lastWeek = (data?.last_week || {}) as Record<string, Record<string, unknown>>;
    const keys = Object.keys(lastWeek).sort((a, b) => a.localeCompare(b, "zh"));
    if (!keys.length) return;
    const row = lastWeek[keys[keys.length - 1]] || {};
    const mt = Number(row["美团店铺"] ?? 0);
    const jd = Number(row["京东到家"] ?? 0);
    uni.setStorageSync(STORAGE_KEY, JSON.stringify({ mt, jd }));
  } catch {
    /* ignore */
  }
}

export function readMineShopStats(): { mt: number; jd: number } | null {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY) as string;
    if (!raw || typeof raw !== "string") return null;
    const o = JSON.parse(raw) as { mt?: unknown; jd?: unknown };
    return { mt: Number(o.mt ?? 0), jd: Number(o.jd ?? 0) };
  } catch {
    return null;
  }
}
