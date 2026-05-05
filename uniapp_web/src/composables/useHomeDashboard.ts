/**
 * 对齐 faster-move-web `src/views/index/index.vue` 中 getData 对 `/homedata/v2/gethomedata` 的解析逻辑
 */
import { reactive, ref, type Ref } from "vue";
import { syncMineShopStatsFromHomedata } from "@/utils/mineShopStatsCache";

export interface TopMetricRow {
  key: string;
  startValue: number;
  decimals: number;
  prefix: string;
  suffix: string;
  separator: string;
  duration: number;
  [k: string]: unknown;
}

export interface MonthMemberDataShape {
  payTop: unknown[];
  memberTop: unknown[];
  shopTop: unknown[];
}

/** 手机端指标卡：仅展示「今日」核心数，剔除 PC TopCard 的昨日对比文案与字段 */
export function sanitizeMobileHomeTitle(raw: string): string {
  let s = String(raw || "").trim();
  if (!s) return s;
  s = s.replace(/[（(][^）)]*相较于昨日[^）)]*[）)]/gi, "");
  s = s.replace(/相较于昨日[\s\S]*/gi, "");
  s = s.replace(/较昨日[\s\S]*/gi, "");
  s = s.replace(/对比昨日[\s\S]*/gi, "");
  s = s.replace(/环比昨日[\s\S]*/gi, "");
  s = s.replace(/对比前日[\s\S]*/gi, "");
  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
}

/** 与「相较于昨日 / of_yday」等相关的上游字段，手机端不展示也不参与逻辑 */
const MOBILE_TOP_METRIC_STRIP_KEYS_LOWER = new Set(
  [
    "of_yday",
    "ofyday",
    "yesterday",
    "yesterday_count",
    "yday_count",
    "yday",
    "day_diff",
    "daydiff",
    "compare_yesterday",
    "diff_yesterday",
    "vs_yesterday",
    "rise_rate",
    "fall_rate",
    "trend_pct",
    "percent_vs_yesterday",
    "chain_ratio",
    "ring_ratio",
    "delta",
    "delta_text",
    "bottom_label",
    "compare_label",
  ].map((k) => k.toLowerCase()),
);

function stripMobileTopMetricKeys(row: Record<string, unknown>): void {
  const dels: string[] = [];
  for (const k of Object.keys(row)) {
    if (MOBILE_TOP_METRIC_STRIP_KEYS_LOWER.has(k.toLowerCase())) dels.push(k);
  }
  for (const k of dels) delete row[k];
}

function sanitizeMobileTopDataCell(cell: Record<string, unknown>): void {
  stripMobileTopMetricKeys(cell);
  const textKeys = ["title", "name", "desc", "subtitle", "sub_title", "subTitle", "tip", "label", "remark"] as const;
  for (const tk of textKeys) {
    const v = cell[tk];
    if (typeof v === "string") cell[tk] = sanitizeMobileHomeTitle(v);
  }
}

/** 兼容上游变体字段（name/value、纯数字数组等），避免月度排行/团队表空白 */
function coerceMonthRows(raw: unknown, kind: "pay" | "member" | "shop"): unknown[] {
  if (!Array.isArray(raw)) return [];
  const out: unknown[] = [];
  for (let idx = 0; idx < raw.length; idx++) {
    const row = raw[idx];
    if (row == null || typeof row === "number" || typeof row === "string") continue;
    if (typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const user_name = String(r.user_name ?? r.name ?? "").trim() || `子账号${idx + 1}`;
    const next: Record<string, unknown> = { ...r, user_name };
    if (kind === "pay") {
      if (next.last_month_count == null && next.value != null) next.last_month_count = next.value;
      if (next.total == null && next.value != null) next.total = next.value;
    }
    out.push(next);
  }
  return out;
}

function coerceBalanceTop(raw: unknown): unknown[] {
  if (!Array.isArray(raw)) return [];
  const out: unknown[] = [];
  for (let idx = 0; idx < raw.length; idx++) {
    const row = raw[idx];
    if (row == null || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const o: Record<string, unknown> = { ...r };
    if (o.user_name == null && o.name != null) o.user_name = o.name;
    if (o.balance == null && o.integral != null) o.balance = o.integral;
    out.push(o);
  }
  return out;
}

export function useHomeDashboard() {
  const topData: Ref<TopMetricRow[]> = ref([]);
  const xAxisData = ref<string[]>([]);
  const centre = ref<number[]>([]);
  const prov = ref<number[]>([]);
  const addNum = ref<number[]>([]);
  const integral = ref<number[]>([]);
  const JdData = ref<number[]>([]);
  const monthMemberData = reactive<MonthMemberDataShape>({
    payTop: [],
    memberTop: [],
    shopTop: [],
  });
  const todoData = reactive({ done: 0, undone: 0 });
  const teamTopList = ref<unknown[]>([]);
  const updateTop = ref<unknown[]>([]);
  const weather = ref<Record<string, unknown>>({});

  function applyPayload(data: Record<string, unknown>) {
    const td = (data.top_data || {}) as Record<string, any>;
    /* 与 PC `faster-move-web/src/views/index/index.vue` getData 顺序一致 */
    /* 与手机首页 metricRows 顺序一致：成员 → 积分 → MT → ELM */
    const preferred = ["member_today", "integral_today", "mt_shop_today", "elm_shop_today"];
    const keys = Object.keys(td);
    let ordered = preferred.filter((k) => keys.includes(k));
    for (const k of keys) {
      if (!ordered.includes(k)) ordered.push(k);
    }
    ordered = ordered.slice(0, 4);
    topData.value = ordered.map((key) => {
      const cell = { ...(td[key] as Record<string, unknown>) };
      sanitizeMobileTopDataCell(cell);
      return {
        key,
        startValue: 0,
        decimals: 0,
        prefix: "",
        suffix: "",
        separator: ",",
        duration: 1200,
        ...cell,
      };
    }) as TopMetricRow[];
    topData.value.forEach((item) => {
      item.count = Math.abs(Number(item.count) || 0);
    });

    const lastWeek = (data.last_week || {}) as Record<string, Record<string, unknown>>;
    xAxisData.value = [];
    centre.value = [];
    prov.value = [];
    addNum.value = [];
    JdData.value = [];
    integral.value = [];
    for (const key in lastWeek) {
      const row = lastWeek[key] || {};
      xAxisData.value.push(key);
      centre.value.push(Number(row["美团店铺"] || 0));
      prov.value.push(Number(row["饿了么店铺"] || 0));
      addNum.value.push(Number(row["新增成员"] || 0));
      JdData.value.push(Number(row["京东到家"] || 0));
      integral.value.push(row["积分消耗"] ? Math.abs(Number(row["积分消耗"])) : 0);
    }

    monthMemberData.payTop = coerceMonthRows(data.month_pay_member, "pay");
    monthMemberData.memberTop = coerceMonthRows(data.month_member_count, "member");
    monthMemberData.shopTop = coerceMonthRows(data.month_shop_count, "shop");

    const cal = (data.calendar_count || {}) as Record<string, unknown>;
    todoData.done = Number(cal.done || 0);
    todoData.undone = Number(cal.undone || 0);

    teamTopList.value = coerceBalanceTop(data.BalanceTop);
    const rawUpdates = [...((data.update_top10 as unknown[]) || [])];
    for (const item of rawUpdates) {
      if (item && typeof item === "object" && typeof (item as Record<string, unknown>).content === "string") {
        const c = (item as Record<string, unknown>).content as string;
        (item as Record<string, unknown>).content = c.replace(/\n/g, "<br>");
      }
    }
    updateTop.value = rawUpdates;
    weather.value = { ...(data.weather as Record<string, unknown>) || {} };
    syncMineShopStatsFromHomedata(data);
  }

  return {
    topData,
    xAxisData,
    centre,
    prov,
    addNum,
    integral,
    JdData,
    monthMemberData,
    todoData,
    teamTopList,
    updateTop,
    weather,
    applyPayload,
  };
}
