/**
 * 开发用本地 HTTP 桥：默认监听 5265，可通过 .env.development 的 API_BRIDGE_PORT 改为 3000 等；转发到 API_UPSTREAM。
 * 内置一个最小的内存「数据库」（10 门店 / 20 用户 / 5 待办）+ CRUD 端点，供 PC/H5 在上游不可达时联调。
 */
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function readEnvFile(fileName) {
  const p = path.join(root, fileName);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const fileEnv = readEnvFile(".env.development");
const API_UPSTREAM = (
  process.env.API_UPSTREAM ||
  fileEnv.API_UPSTREAM ||
  "http://120.24.48.102:5265/"
).trim();
const LISTEN_PORT = Number(process.env.API_BRIDGE_PORT || fileEnv.API_BRIDGE_PORT || 5265);
const LISTEN_HOST = (process.env.API_BRIDGE_BIND || fileEnv.API_BRIDGE_BIND || "127.0.0.1").trim();
const BRIDGE_LAN_HOST = (process.env.API_BRIDGE_LAN_HOST || fileEnv.API_BRIDGE_LAN_HOST || "").trim();
const CORS_EXTRA = String(
  process.env.API_BRIDGE_CORS_WHITELIST || fileEnv.API_BRIDGE_CORS_WHITELIST || "",
).trim();

function parseCorsWhitelist() {
  const defaults = [
    "http://10.10.10.177:5173",
    "http://10.10.10.177:5200",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ];
  const extra = CORS_EXTRA.split(/[\s,]+/)
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([...defaults, ...extra])];
}

const CORS_WHITELIST = parseCorsWhitelist();
const UPSTREAM_TIMEOUT = Number(
  process.env.API_BRIDGE_UPSTREAM_TIMEOUT || fileEnv.API_BRIDGE_UPSTREAM_TIMEOUT || 4000
);
/** 门店/业务列表等较重接口：默认 60s，避免手机 iframe 内 PC 端误报超时 */
const UPSTREAM_TIMEOUT_LONG = Number(
  process.env.API_BRIDGE_UPSTREAM_TIMEOUT_LONG || fileEnv.API_BRIDGE_UPSTREAM_TIMEOUT_LONG || 60000
);
const FALLBACK_ON_FAIL = String(
  process.env.API_BRIDGE_FALLBACK || fileEnv.API_BRIDGE_FALLBACK || "true"
).toLowerCase() === "true";
const LOG_API =
  String(process.env.API_BRIDGE_LOG_API || fileEnv.API_BRIDGE_LOG_API || "true").toLowerCase() === "true";
const ENRICH_EMPTY_HOMEDATA =
  String(
    process.env.API_BRIDGE_ENRICH_EMPTY_HOMEDATA || fileEnv.API_BRIDGE_ENRICH_EMPTY_HOMEDATA || "true"
  ).toLowerCase() === "true";
/**
 * 运行时 Mock 模式（中央开关）
 *  - "mock": 拦截所有 /seed/*、/admin/* 等并返回种子；广播 SSE
 *  - "real": 透传到上游（不返回种子；SSE 仍连接但不广播 change，仅广播 mode-change）
 *  默认 mock；可通过 .env 的 API_BRIDGE_MODE 覆盖；运行时 POST /seed/mode 切换
 */
let bridgeMode = String(
  process.env.API_BRIDGE_MODE || fileEnv.API_BRIDGE_MODE || "mock"
).toLowerCase() === "real" ? "real" : "mock";

const upstream = new URL(API_UPSTREAM.endsWith("/") ? API_UPSTREAM : `${API_UPSTREAM}/`);
const isHttps = upstream.protocol === "https:";
const defaultPort = isHttps ? 443 : 80;
const upstreamPort = upstream.port ? Number(upstream.port) : defaultPort;
const upstreamHost = upstream.hostname;

/* ---------- 种子数据（可变，CRUD 即在此结构上进行） ---------- */
const SEED_PLATFORMS = [
  { typeStr: "mt-shop-feature", title: "美团" },
  { typeStr: "elm-shop-feature", title: "饿了么" },
  { typeStr: "jd-shop-feature", title: "京东到家" },
  { typeStr: "dy-retail-feature", title: "抖音零售" },
  { typeStr: "mt-medicine-feature", title: "美团医药" },
];
// 15 家门店 = 5 平台 × 3 家，平台标签可见；开发环境 Mock 数据均带 __mock 标签
const MOCK_TAG = { __mock: true, __source: "dev-bridge" };
function initialSeed() {
  SEED_STORES = Array.from({ length: 15 }, (_, i) => {
    const platform = SEED_PLATFORMS[i % SEED_PLATFORMS.length];
    return {
      shop_id: 1001 + i,
      shop_name: `${platform.title}-门店${String(Math.floor(i / SEED_PLATFORMS.length) + 1).padStart(2, "0")}`,
      platform_type: platform.typeStr,
      platform_title: platform.title,
      status: i % 4 === 0 ? 0 : 1,
      address: `北京市海淀区中关村大街 ${10 + i} 号`,
      create_time: `2026-04-${String((i % 28) + 1).padStart(2, "0")} 10:00:00`,
      ...MOCK_TAG,
    };
  });
  SEED_USERS = Array.from({ length: 20 }, (_, i) => {
    const shop = SEED_STORES[i % SEED_STORES.length];
    return {
      id: 2001 + i,
      user_name: `测试用户${String(i + 1).padStart(2, "0")}`,
      phone: `1809089${String(1000 + i).padStart(4, "0")}`,
      shop_id: shop.shop_id,
      shop_name: shop.shop_name,
      role: i < 2 ? "ADMIN" : i < 6 ? "AGENCY" : "STAFF",
      balance: Math.round((50 + Math.random() * 9500) * 100) / 100,
      integral: 100 + i * 13,
      create_time: shop.create_time,
      ...MOCK_TAG,
    };
  });
  SEED_TODOS = [
    { id: 1, user_id: 2001, title: "审核新接入的美团门店授权", status: 0, due: "2026-05-04 10:00", ...MOCK_TAG },
    { id: 2, user_id: 2002, title: "回访 3 家上周新增门店运营情况", status: 0, due: "2026-05-04 14:30", ...MOCK_TAG },
    { id: 3, user_id: 2003, title: "处理饿了么店铺异常推送告警", status: 0, due: "2026-05-05 09:00", ...MOCK_TAG },
    { id: 4, user_id: 2001, title: "导出 4 月份代理商对账数据", status: 1, due: "2026-05-02 18:00", ...MOCK_TAG },
    { id: 5, user_id: 2004, title: "校验抖音零售门店类目映射", status: 0, due: "2026-05-06 11:00", ...MOCK_TAG },
  ];
}
let SEED_STORES = Array.from({ length: 15 }, (_, i) => {
  const platform = SEED_PLATFORMS[i % SEED_PLATFORMS.length];
  return {
    shop_id: 1001 + i,
    shop_name: `${platform.title}-门店${String(Math.floor(i / SEED_PLATFORMS.length) + 1).padStart(2, "0")}`,
    platform_type: platform.typeStr,
    platform_title: platform.title,
    status: i % 4 === 0 ? 0 : 1,
    address: `北京市海淀区中关村大街 ${10 + i} 号`,
    create_time: `2026-04-${String((i % 28) + 1).padStart(2, "0")} 10:00:00`,
    ...MOCK_TAG,
  };
});
let SEED_USERS = Array.from({ length: 20 }, (_, i) => {
  const shop = SEED_STORES[i % SEED_STORES.length];
  return {
    id: 2001 + i,
    user_name: `测试用户${String(i + 1).padStart(2, "0")}`,
    phone: `1809089${String(1000 + i).padStart(4, "0")}`,
    shop_id: shop.shop_id,
    shop_name: shop.shop_name,
    role: i < 2 ? "ADMIN" : i < 6 ? "AGENCY" : "STAFF",
    balance: Math.round((50 + Math.random() * 9500) * 100) / 100,
    integral: 100 + i * 13,
    create_time: shop.create_time,
    ...MOCK_TAG,
  };
});
let SEED_TODOS = [
  { id: 1, user_id: 2001, title: "审核新接入的美团门店授权", status: 0, due: "2026-05-04 10:00", ...MOCK_TAG },
  { id: 2, user_id: 2002, title: "回访 3 家上周新增门店运营情况", status: 0, due: "2026-05-04 14:30", ...MOCK_TAG },
  { id: 3, user_id: 2003, title: "处理饿了么店铺异常推送告警", status: 0, due: "2026-05-05 09:00", ...MOCK_TAG },
  { id: 4, user_id: 2001, title: "导出 4 月份代理商对账数据", status: 1, due: "2026-05-02 18:00", ...MOCK_TAG },
  { id: 5, user_id: 2004, title: "校验抖音零售门店类目映射", status: 0, due: "2026-05-06 11:00", ...MOCK_TAG },
];

const nextId = (rows, key) => (rows.length ? Math.max(...rows.map((r) => Number(r[key]) || 0)) + 1 : 1);

function platformCountsMap() {
  return SEED_PLATFORMS.reduce((acc, p) => {
    acc[p.typeStr] = SEED_STORES.filter((s) => s.platform_type === p.typeStr).length;
    return acc;
  }, /** @type {Record<string,number>} */ ({}));
}

function buildStats() {
  const counts = platformCountsMap();
  const byPlatform = SEED_PLATFORMS.map((p) => ({
    type: p.typeStr,
    title: p.title,
    count: counts[p.typeStr] || 0,
  }));
  return {
    stores: SEED_STORES.length,
    users: SEED_USERS.length,
    todos: SEED_TODOS.length,
    todos_undone: SEED_TODOS.filter((t) => t.status === 0).length,
    todos_done: SEED_TODOS.filter((t) => t.status === 1).length,
    byPlatform,
  };
}

function buildHomeAggregate() {
  const counts = platformCountsMap();
  const integralSum = SEED_USERS.reduce((s, u) => s + (Number(u.integral) || 0), 0);
  // 还原为原版 4 项「今日新增/消耗」卡片：data_type 与 PC TopCard 的彩色图标分支对应
  // 1=美团  2=饿了么  200=新增成员（group-fill）  100=消耗积分（database-2-fill）
  const top_data = {
    member_today: {
      title: "今日新增成员(团队)",
      count: SEED_USERS.length,
      data_type: 200,
      unit: "人",
      all_total: SEED_USERS.length,
      target: { type: "users" },
    },
    integral_today: {
      title: "今日消耗积分(团队)",
      count: integralSum,
      data_type: 100,
      unit: "分",
      all_total: integralSum,
      target: { type: "users" },
    },
    mt_shop_today: {
      title: "今日新增MT店铺(团队)",
      count: counts["mt-shop-feature"] || 0,
      data_type: 1,
      unit: "家",
      all_total: counts["mt-shop-feature"] || 0,
      target: { type: "stores", platform: "mt-shop-feature" },
    },
    elm_shop_today: {
      title: "今日新增ELM店铺(团队)",
      count: counts["elm-shop-feature"] || 0,
      data_type: 2,
      unit: "家",
      all_total: counts["elm-shop-feature"] || 0,
      target: { type: "stores", platform: "elm-shop-feature" },
    },
  };
  const done = SEED_TODOS.filter((t) => t.status === 1).length;
  const undone = SEED_TODOS.filter((t) => t.status === 0).length;
  const balanceTop = [...SEED_USERS]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map((u) => ({
      name: u.shop_name || u.user_name,
      user_name: u.user_name,
      shop_name: u.shop_name,
      balance: u.balance,
      integral: u.integral,
    }));
  const rankUsersForMonth = [...SEED_USERS].slice(0, 12);
  // PC 首页 chart 期望的 last_week 形状（中文键）
  const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const last_week = weekDays.reduce((acc, d, i) => {
    acc[d] = {
      "美团店铺": (counts["mt-shop-feature"] || 0) + ((i * 2) % 3),
      "饿了么店铺": (counts["elm-shop-feature"] || 0) + (i % 3),
      "京东到家": (counts["jd-shop-feature"] || 0) + (i % 2),
      "新增成员": Math.max(1, (i + 1) % 5),
      "积分消耗": 80 + i * 7,
    };
    return acc;
  }, /** @type {Record<string, Record<string, number>>} */ ({}));
  return {
    top_data,
    weather: {
      describe: `北京 多云转晴 18~26℃ · 共 ${SEED_STORES.length} 家测试门店在网`,
      detail: "PM2.5 35 良 · 东南风 2 级",
      uptime: Date.now(),
    },
    calendar_count: { done, undone },
    todo_list: SEED_TODOS,
    last_week,
    /* 与 faster-move-web AppHomeDataVo / MemberDataMonthClass* 字段对齐，避免 H5 列表解析为「暂无数据」 */
    month_pay_member: rankUsersForMonth.map((u, i) => ({
      admin: String(u.id),
      top: i + 1,
      user_name: u.user_name,
      member_id: u.id,
      last_month_count: 120 + i * 11,
      total: 800 + i * 73,
    })),
    month_member_count: rankUsersForMonth.map((u, i) => ({
      admin: String(u.id),
      top: i + 1,
      user_name: u.user_name,
      member_id: u.id,
      last_month_count: (i % 4) + 1,
      today_add: i % 3,
      total: 3 + i * 2,
    })),
    month_shop_count: rankUsersForMonth.map((u, i) => ({
      admin: String(u.id),
      top: i + 1,
      user_name: u.user_name,
      member_id: u.id,
      total: 4 + i * 2,
      mt_count: 2 + (i % 5),
      elm_count: 1 + (i % 4),
    })),
    BalanceTop: balanceTop,
    update_top10: SEED_STORES.slice(0, 10).map((s) => ({
      shop_name: s.shop_name,
      platform: s.platform_title,
      content: `${s.platform_title} · ${s.shop_name}\n创建于 ${s.create_time}`,
    })),
  };
}

/** 业务 API 访问日志：与真实后端对齐的常用前缀均记录，便于手机 Tab 联调 */
function shouldLogApiPath(pathname) {
  return (
    pathname.startsWith("/api") ||
    pathname.includes("/api/") ||
    pathname.startsWith("/homedata") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/shopmg") ||
    pathname.startsWith("/shopusergroup") ||
    pathname.startsWith("/system/") ||
    pathname.startsWith("/userManagement")
  );
}

/** /api、/shop*、/shopmg* 等走更长超时，避免 PC iframe 内门店页慢查询被桥误判断连 */
function upstreamTimeoutMs(pathname) {
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/shopmg") ||
    pathname.startsWith("/shopusergroup") ||
    pathname.startsWith("/system/")
  ) {
    return Math.max(UPSTREAM_TIMEOUT, UPSTREAM_TIMEOUT_LONG);
  }
  return UPSTREAM_TIMEOUT;
}

function logBridgeApi(direction, method, pathname, detail) {
  if (!LOG_API || !shouldLogApiPath(pathname)) return;
  const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
  console.log(`[bridge-api] ${direction} ${method} ${pathname} ${msg}`);
}

function homedataMonthPayRowValid(row) {
  if (!row || typeof row !== "object") return false;
  const name = row.user_name ?? row.name;
  if (name == null || String(name) === "") return false;
  return row.last_month_count != null || row.total != null || row.value != null;
}

function homedataMonthMemberRowValid(row) {
  if (!row || typeof row !== "object") return false;
  if (row.user_name == null && row.name == null) return false;
  return row.total != null || row.today_add != null || row.last_month_count != null;
}

function homedataMonthShopRowValid(row) {
  if (!row || typeof row !== "object") return false;
  if (row.user_name == null && row.name == null) return false;
  return row.mt_count != null || row.elm_count != null || row.total != null;
}

function homedataBalanceRowValid(row) {
  if (!row || typeof row !== "object") return false;
  const hasName = row.user_name != null || row.name != null || row.shop_name != null;
  return hasName && row.balance != null;
}

function shouldMergeMonthList(arr, kind) {
  if (!Array.isArray(arr) || arr.length === 0) return true;
  const first = arr[0];
  if (typeof first === "number" || typeof first === "string") return true;
  if (first == null || typeof first !== "object") return true;
  if (kind === "pay") return !homedataMonthPayRowValid(first);
  if (kind === "member") return !homedataMonthMemberRowValid(first);
  if (kind === "shop") return !homedataMonthShopRowValid(first);
  return true;
}

function shouldMergeBalanceTop(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return true;
  const first = arr[0];
  if (first == null || typeof first !== "object") return true;
  return !homedataBalanceRowValid(first);
}

/** 上游 200 时：top_data 空则补卡片；排行/团队列表空或形状不对则补种子，避免手机模块「暂无数据」 */
function enrichHomedataBodyIfNeeded(buf, contentEncoding) {
  if (!ENRICH_EMPTY_HOMEDATA || (contentEncoding && String(contentEncoding).toLowerCase().includes("gzip")))
    return buf;
  try {
    const txt = buf.toString("utf8");
    const j = JSON.parse(txt);
    if (j.code !== 200 || !j.data || typeof j.data !== "object") return buf;
    const seed = buildHomeAggregate();
    const d = j.data;
    const td = d.top_data;
    const topEmpty = !td || typeof td !== "object" || Object.keys(td).length === 0;

    let merged = false;
    const out = { ...d };
    if (topEmpty) {
      out.top_data = seed.top_data;
      merged = true;
    }
    if (shouldMergeMonthList(d.month_pay_member, "pay")) {
      out.month_pay_member = seed.month_pay_member;
      merged = true;
    }
    if (shouldMergeMonthList(d.month_member_count, "member")) {
      out.month_member_count = seed.month_member_count;
      merged = true;
    }
    if (shouldMergeMonthList(d.month_shop_count, "shop")) {
      out.month_shop_count = seed.month_shop_count;
      merged = true;
    }
    if (shouldMergeBalanceTop(d.BalanceTop)) {
      out.BalanceTop = seed.BalanceTop;
      merged = true;
    }
    if (!merged) return buf;
    j.data = out;
    console.warn(
      "[api-dev-bridge] 上游 homedata 已用种子补齐空缺的 top_data / 月度排行 / BalanceTop（API_BRIDGE_ENRICH_EMPTY_HOMEDATA=true）"
    );
    return Buffer.from(JSON.stringify(j), "utf8");
  } catch {
    return buf;
  }
}

const ok = (data, msg = "ok (dev-seed)") => ({ code: 200, data, msg });

/* ---------- SSE 订阅总线 ---------- */
const sseClients = new Set();
function sseBroadcast(eventName, payload) {
  const data = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(data);
    } catch {
      sseClients.delete(res);
    }
  }
}
function emitChange(resource, action, payload) {
  if (bridgeMode !== "mock") return;
  sseBroadcast("change", { resource, action, payload, ts: Date.now(), stats: buildStats() });
}
function emitMode(reason = "") {
  sseBroadcast("mode", { mode: bridgeMode, mock: bridgeMode === "mock", reason, ts: Date.now() });
}
function emitClear() {
  sseBroadcast("clear", { ts: Date.now(), stats: buildStats() });
}

/* ---------- 本地直接处理（CRUD + 已知接口），不经过上游 ---------- */
function requestPath(urlPath) {
  return String(urlPath || "/").split("?")[0];
}

function localHandle(method, urlPath, body) {
  const path = requestPath(urlPath);
  // 中央配置端点（无论 mode，始终可读）
  if (method === "GET" && path.startsWith("/seed/config")) {
    return ok({
      mode: bridgeMode,
      mock: bridgeMode === "mock",
      stats: bridgeMode === "mock" ? buildStats() : null,
      ts: Date.now(),
    });
  }
  if (method === "POST" && path.startsWith("/seed/mode")) {
    const next = String(body && body.mode || "").toLowerCase() === "real" ? "real" : "mock";
    bridgeMode = next;
    emitMode("toggle");
    return ok({ mode: bridgeMode, mock: bridgeMode === "mock" }, "mode switched");
  }
  if (method === "POST" && path.startsWith("/seed/clear")) {
    SEED_STORES = [];
    SEED_USERS = [];
    SEED_TODOS = [];
    // 同时为各资源发 change 事件，让所有现有订阅者（PC 列表 / 手机首页）一起刷新
    emitChange("stores", "clear", []);
    emitChange("users", "clear", []);
    emitChange("todos", "clear", []);
    emitClear();
    return ok({ stats: buildStats() }, "cleared");
  }
  if (method === "POST" && path.startsWith("/seed/reset")) {
    // 还原到默认初始 15/20/5 种子（便于演示重置）
    initialSeed();
    emitChange("stores", "reset", SEED_STORES);
    emitChange("users", "reset", SEED_USERS);
    emitChange("todos", "reset", SEED_TODOS);
    sseBroadcast("reset", { ts: Date.now(), stats: buildStats() });
    return ok({ stats: buildStats() }, "reset");
  }

  // real 模式下，所有非 /seed/config|/seed/mode|/seed/reset 都不再走本地处理
  if (bridgeMode === "real") return null;

  // 登录 / 当前用户 / 首页聚合
  if (method === "POST" && path.startsWith("/admin/agencylogin")) {
    return ok({ ResultType: 0, Token: "dev-seed-token" });
  }
  if (method === "GET" && path.startsWith("/admin/getagencyinfo")) {
    const me = SEED_USERS[0];
    if (!me) {
      return ok({
        admin: {
          id: 0,
          user_name: "桥接未就绪",
          phone: "",
          avatar: "",
          role: ["GUEST"],
          shop_id: 0,
          shop_name: "",
        },
      });
    }
    return ok({
      admin: {
        id: me.id,
        user_name: me.user_name,
        phone: me.phone,
        avatar: "",
        role: [me.role],
        shop_id: me.shop_id,
        shop_name: me.shop_name,
      },
    });
  }
  if (method === "GET" && path.startsWith("/homedata/v2/gethomedata")) {
    return ok(buildHomeAggregate());
  }
  if (method === "GET" && path.startsWith("/seed/stats")) {
    return ok(buildStats());
  }

  /* /seed/stores 相关 */
  if (method === "GET" && path.startsWith("/seed/stores")) return ok(SEED_STORES);
  if (method === "POST" && path.startsWith("/seed/stores/add")) {
    const platform =
      SEED_PLATFORMS.find((p) => p.typeStr === body.platform_type) || SEED_PLATFORMS[0];
    const row = {
      shop_id: nextId(SEED_STORES, "shop_id"),
      shop_name: String(body.shop_name || `新门店-${Date.now()}`),
      platform_type: platform.typeStr,
      platform_title: platform.title,
      status: Number(body.status ?? 1),
      address: String(body.address || ""),
      create_time: new Date().toISOString().replace("T", " ").slice(0, 19),
      ...MOCK_TAG,
    };
    SEED_STORES.push(row);
    emitChange("stores", "add", row);
    return ok(row, "added (dev-seed)");
  }
  if (method === "POST" && path.startsWith("/seed/stores/update")) {
    const idx = SEED_STORES.findIndex((s) => s.shop_id === Number(body.shop_id));
    if (idx < 0) return { code: 404, msg: "store not found", data: null };
    const platform = SEED_PLATFORMS.find((p) => p.typeStr === body.platform_type);
    SEED_STORES[idx] = {
      ...SEED_STORES[idx],
      ...body,
      shop_id: SEED_STORES[idx].shop_id,
      platform_title: platform ? platform.title : SEED_STORES[idx].platform_title,
    };
    emitChange("stores", "update", SEED_STORES[idx]);
    return ok(SEED_STORES[idx], "updated (dev-seed)");
  }
  if (method === "POST" && path.startsWith("/seed/stores/delete")) {
    const id = Number(body.shop_id);
    const before = SEED_STORES.length;
    SEED_STORES = SEED_STORES.filter((s) => s.shop_id !== id);
    emitChange("stores", "delete", { shop_id: id });
    return ok({ removed: before - SEED_STORES.length }, "deleted (dev-seed)");
  }

  /* /seed/users 相关（PC userManagement.* 也别名到这里） */
  if (
    (method === "GET" && (path.startsWith("/seed/users") || path.startsWith("/userManagement/getList")))
  ) {
    return ok({ list: SEED_USERS, total: SEED_USERS.length });
  }
  if (
    method === "POST" &&
    (path.startsWith("/seed/users/add") || path.startsWith("/userManagement/doEdit"))
  ) {
    if (body && Number(body.id)) {
      const idx = SEED_USERS.findIndex((u) => u.id === Number(body.id));
      if (idx >= 0) {
        SEED_USERS[idx] = { ...SEED_USERS[idx], ...body, id: SEED_USERS[idx].id };
        if (body.shop_id) {
          const shop = SEED_STORES.find((s) => s.shop_id === Number(body.shop_id));
          if (shop) SEED_USERS[idx].shop_name = shop.shop_name;
        }
        emitChange("users", "update", SEED_USERS[idx]);
        return ok(SEED_USERS[idx], "updated (dev-seed)");
      }
    }
    const shop = SEED_STORES.find((s) => s.shop_id === Number(body.shop_id)) || SEED_STORES[0];
    const row = {
      id: nextId(SEED_USERS, "id"),
      user_name: String(body.user_name || `新用户-${Date.now()}`),
      phone: String(body.phone || ""),
      shop_id: shop.shop_id,
      shop_name: shop.shop_name,
      role: String(body.role || "STAFF"),
      balance: Number(body.balance || 0),
      integral: Number(body.integral || 0),
      create_time: new Date().toISOString().replace("T", " ").slice(0, 19),
      ...MOCK_TAG,
    };
    SEED_USERS.push(row);
    emitChange("users", "add", row);
    return ok(row, "added (dev-seed)");
  }
  if (
    method === "POST" &&
    (path.startsWith("/seed/users/delete") || path.startsWith("/userManagement/doDelete"))
  ) {
    const id = Number(body.id);
    const before = SEED_USERS.length;
    SEED_USERS = SEED_USERS.filter((u) => u.id !== id);
    emitChange("users", "delete", { id });
    return ok({ removed: before - SEED_USERS.length }, "deleted (dev-seed)");
  }

  /* /seed/todos 相关 */
  if (method === "GET" && path.startsWith("/seed/todos")) return ok(SEED_TODOS);
  if (method === "POST" && path.startsWith("/seed/todos/add")) {
    const row = {
      id: nextId(SEED_TODOS, "id"),
      user_id: Number(body.user_id) || (SEED_USERS[0] && SEED_USERS[0].id) || 0,
      title: String(body.title || `新待办-${Date.now()}`),
      status: Number(body.status ?? 0),
      due: String(body.due || ""),
      ...MOCK_TAG,
    };
    SEED_TODOS.push(row);
    emitChange("todos", "add", row);
    return ok(row, "added (dev-seed)");
  }
  if (method === "POST" && path.startsWith("/seed/todos/update")) {
    const idx = SEED_TODOS.findIndex((t) => t.id === Number(body.id));
    if (idx < 0) return { code: 404, msg: "todo not found", data: null };
    SEED_TODOS[idx] = { ...SEED_TODOS[idx], ...body, id: SEED_TODOS[idx].id };
    emitChange("todos", "update", SEED_TODOS[idx]);
    return ok(SEED_TODOS[idx], "updated (dev-seed)");
  }
  if (method === "POST" && path.startsWith("/seed/todos/delete")) {
    const id = Number(body.id);
    const before = SEED_TODOS.length;
    SEED_TODOS = SEED_TODOS.filter((t) => t.id !== id);
    emitChange("todos", "delete", { id });
    return ok({ removed: before - SEED_TODOS.length }, "deleted (dev-seed)");
  }

  return null;
}

/** real 模式且上游不可达/5xx 时，对部分接口用种子兜底（含登录 POST，避免上游 500 时手机无法进首页） */
function realModeUpstreamFallback(method, urlPath) {
  if (!FALLBACK_ON_FAIL || bridgeMode !== "real") return null;
  const path = requestPath(urlPath);
  if (method === "POST" && path.startsWith("/admin/agencylogin")) {
    return ok({ ResultType: 0, Token: "dev-seed-token" });
  }
  if (method === "GET" && path.startsWith("/homedata/v2/gethomedata")) {
    return ok(buildHomeAggregate());
  }
  if (method === "GET" && path.startsWith("/admin/getagencyinfo")) {
    const me = SEED_USERS[0];
    if (!me) {
      return ok({
        admin: {
          id: 0,
          user_name: "桥接未就绪",
          phone: "",
          avatar: "",
          role: ["GUEST"],
          shop_id: 0,
          shop_name: "",
        },
      });
    }
    return ok({
      admin: {
        id: me.id,
        user_name: me.user_name,
        phone: me.phone,
        avatar: "",
        role: [me.role],
        shop_id: me.shop_id,
        shop_name: me.shop_name,
      },
    });
  }
  return null;
}

/* ---------- 通用 HTTP 工具 ---------- */
function buildHeaders(raw) {
  const out = { ...raw };
  out.host = `${upstreamHost}:${upstreamPort}`;
  return out;
}

/** 开发：RFC1918 / 本机回环 Origin 回显，便于手机 WiFi 跨网段联调 */
function corsOriginAllowed(origin) {
  if (!origin || typeof origin !== "string") return false;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    if (host === "127.0.0.1" || host === "localhost") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

function isWeChatUa(clientReq) {
  const ua = String(clientReq.headers["user-agent"] || "").toLowerCase();
  return ua.includes("micromessenger");
}

function corsHeaders(clientReq) {
  const origin = clientReq.headers.origin;
  const h = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers":
      clientReq.headers["access-control-request-headers"] ||
      "Authorization,Content-Type,DNT,User-Agent,X-Requested-With,Accept,Origin",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  /** 白名单内回显 Origin（便于带 Cookie 场景）；其余仍临时 * 方便联调 */
  if (origin && typeof origin === "string" && CORS_WHITELIST.includes(origin.replace(/\/$/, ""))) {
    h["Access-Control-Allow-Origin"] = origin.replace(/\/$/, "");
    h["Access-Control-Allow-Credentials"] = "true";
  } else {
    h["Access-Control-Allow-Origin"] = "*";
  }
  if (isWeChatUa(clientReq)) {
    h["X-WeChat-UA-Allowed"] = "1";
  }
  return h;
}

function readBody(req, limit = 1 << 20) {
  return new Promise((resolve, reject) => {
    let len = 0;
    const chunks = [];
    req.on("data", (c) => {
      len += c.length;
      if (len > limit) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function tryJSON(buf) {
  if (!buf || !buf.length) return {};
  try {
    return JSON.parse(buf.toString("utf8"));
  } catch {
    return {};
  }
}

function writeJSON(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=UTF-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

/* ---------- HTTP 服务 ---------- */
const server = http.createServer(async (clientReq, clientRes) => {
  if (clientReq.method === "OPTIONS") {
    clientRes.writeHead(204, corsHeaders(clientReq));
    clientRes.end();
    return;
  }

  const targetPath = clientReq.url || "/";
  const method = clientReq.method || "GET";
  const pathname = targetPath.split("?")[0];

  // SSE 实时事件流
  if (method === "GET" && targetPath.startsWith("/seed/events")) {
    clientRes.writeHead(200, {
      "Content-Type": "text/event-stream; charset=UTF-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...corsHeaders(clientReq),
    });
    clientRes.write(`retry: 2000\n\n`);
    clientRes.write(
      `event: hello\ndata: ${JSON.stringify({
        mode: bridgeMode,
        mock: bridgeMode === "mock",
        stats: bridgeMode === "mock" ? buildStats() : null,
        ts: Date.now(),
      })}\n\n`
    );
    sseClients.add(clientRes);

    const heartbeat = setInterval(() => {
      try {
        clientRes.write(`: ping ${Date.now()}\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 15000);
    clientReq.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(clientRes);
    });
    return;
  }

  // 优先尝试本地直接处理（CRUD + 已知 GET）
  let body = {};
  if (method !== "GET" && method !== "HEAD") {
    try {
      const raw = await readBody(clientReq);
      body = tryJSON(raw);
      // 同时为可能的上游转发保留 body
      clientReq.savedBody = raw;
    } catch {
      writeJSON(clientRes, 413, { code: 413, msg: "body too large", data: null }, corsHeaders(clientReq));
      return;
    }
  }

  const localResp = localHandle(method, targetPath, body || {});
  if (localResp) {
    if (shouldLogApiPath(pathname)) {
      logBridgeApi("<--", method, pathname, {
        source: "local-handle",
        code: localResp.code,
        dataKeys:
          localResp.data && typeof localResp.data === "object" && !Array.isArray(localResp.data)
            ? Object.keys(localResp.data).slice(0, 16)
            : [],
      });
    }
    writeJSON(
      clientRes,
      Number(localResp.code) === 200 ? 200 : Number(localResp.code) || 200,
      localResp,
      { "X-Dev-Seed": "1", ...corsHeaders(clientReq) }
    );
    return;
  }

  if (bridgeMode === "real" && shouldLogApiPath(pathname)) {
    logBridgeApi("-->", method, pathname, { upstream: `${upstreamHost}:${upstreamPort}`, mode: "real" });
  }

  // 否则走上游，并在失败时尝试兜底
  const opts = {
    protocol: upstream.protocol,
    hostname: upstreamHost,
    port: upstreamPort,
    method,
    path: targetPath,
    headers: buildHeaders(clientReq.headers),
  };

  const lib = isHttps ? https : http;
  let settled = false;
  const finishWithFallback = (reason) => {
    if (settled) return;
    settled = true;
    let fb = FALLBACK_ON_FAIL ? localHandle(method, targetPath, body || {}) : null;
    if (!fb) fb = realModeUpstreamFallback(method, targetPath);
    if (fb) {
      console.warn(`[api-dev-bridge] 上游不可达(${reason})，本地兜底 ${method} ${targetPath}`);
      if (shouldLogApiPath(pathname)) {
        logBridgeApi("<--", method, pathname, { source: "fallback-error", reason: String(reason).slice(0, 200) });
      }
      writeJSON(clientRes, 200, fb, { "X-Dev-Fallback": "1", ...corsHeaders(clientReq) });
      return;
    }
    if (shouldLogApiPath(pathname)) {
      logBridgeApi("<--", method, pathname, { source: "error", code: 502, reason: String(reason).slice(0, 200) });
    }
    writeJSON(
      clientRes,
      502,
      { code: 502, msg: `[api-dev-bridge] 上游不可达: ${upstreamHost}:${upstreamPort} — ${reason}`, data: null },
      corsHeaders(clientReq)
    );
  };

  const upTimeout = upstreamTimeoutMs(pathname);
  const p = lib.request(opts, (upRes) => {
    const code = upRes.statusCode || 0;
    const chunks = [];

    upRes.on("data", (c) => chunks.push(c));
    upRes.on("end", () => {
      if (settled) return;

      if (code >= 500 && FALLBACK_ON_FAIL) {
        const fb = realModeUpstreamFallback(method, targetPath);
        if (fb) {
          settled = true;
          console.warn(`[api-dev-bridge] 上游 HTTP ${code}，本地兜底 ${method} ${targetPath}`);
          if (shouldLogApiPath(pathname)) {
            logBridgeApi("<--", method, pathname, { source: "fallback-5xx", upstreamStatus: code });
          }
          writeJSON(clientRes, 200, fb, { "X-Dev-Fallback": "1", ...corsHeaders(clientReq) });
          return;
        }
      }

      settled = true;
      let out = Buffer.concat(chunks);
      const enc = upRes.headers["content-encoding"];

      if (bridgeMode === "real" && shouldLogApiPath(pathname)) {
        const preview = out.slice(0, 1500).toString("utf8").replace(/\s+/g, " ");
        logBridgeApi("<--", method, pathname, `HTTP ${code} enc=${enc || "-"} len=${out.length} ${preview}`);
      }

      if (
        code === 200 &&
        pathname.startsWith("/homedata/v2/gethomedata") &&
        /json/i.test(String(upRes.headers["content-type"] || ""))
      ) {
        out = enrichHomedataBodyIfNeeded(out, enc);
      }

      const h = { ...upRes.headers, ...corsHeaders(clientReq) };
      delete h["content-length"];
      h["content-length"] = String(out.length);
      clientRes.writeHead(code || 502, h);
      clientRes.end(out);
    });
  });

  p.setTimeout(upTimeout, () => p.destroy(new Error(`upstream timeout ${upTimeout}ms`)));
  p.on("error", (err) => finishWithFallback(err.message));

  if (clientReq.savedBody && clientReq.savedBody.length) p.write(clientReq.savedBody);
  p.end();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[api-dev-bridge] 端口 ${LISTEN_PORT} 已被占用。请先结束 mock-backend 或其它进程，或设置 API_BRIDGE_PORT=5266 并同步修改 .env.development 的 VITE_PROXY_TARGET。`
    );
  } else {
    console.error("[api-dev-bridge]", err);
  }
  process.exit(1);
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`[api-dev-bridge] Listening on ${LISTEN_HOST}:${LISTEN_PORT}`);
  if (BRIDGE_LAN_HOST && BRIDGE_LAN_HOST !== LISTEN_HOST) {
    console.log(`[api-dev-bridge] 对外说明用主机名: http://${BRIDGE_LAN_HOST}:${LISTEN_PORT}`);
  }
  console.log(
    `[api-dev-bridge] 上游 ${upstream.protocol}//${upstreamHost}:${upstreamPort} (默认超时 ${UPSTREAM_TIMEOUT}ms，/api|/shop* 等 ${UPSTREAM_TIMEOUT_LONG}ms${FALLBACK_ON_FAIL ? "，兜底=on" : ""})`
  );
  console.log(
    `[api-dev-bridge] 本地 CRUD 端点: /seed/{stores,users,todos}/{add,update,delete} 与 /userManagement/{getList,doEdit,doDelete}`
  );
  console.log(`[api-dev-bridge] 实时事件: /seed/events (SSE)，统计: /seed/stats`);
  console.log(`[api-dev-bridge] 中央配置: GET /seed/config | POST /seed/mode | /seed/clear | /seed/reset`);
  console.log(`[api-dev-bridge] 当前 mode = ${bridgeMode}`);
});
