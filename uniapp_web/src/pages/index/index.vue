<template>
  <view class="page">
    <view class="index-dashboard-shell">

      <!-- 顶部用户信息头 -->
      <view class="page-hdr">
        <view class="hdr-left">
          <text class="hdr-brand">极狐</text>
          <text class="hdr-welcome">欢迎回来，{{ displayName }}</text>
        </view>
        <view
          class="hdr-avatar tappable"
          hover-class="hdr-avatar-hover"
          @tap="goAdminPc(ALIGNED_PC_HASH.SETTING_PERSONAL_CENTER)"
        >
          <text class="avatar-letter">{{ avatarLetter }}</text>
        </view>
      </view>

      <view v-if="loading" class="card muted load-hint">加载中…</view>
      <view v-else-if="error" class="card err err-card">
        <text class="err-msg">{{ error }}</text>
        <button class="retry-btn" @tap="load">重试</button>
      </view>
      <template v-else>

        <!-- 通知栏：点击进入公告列表 -->
        <view
          class="notice-strip tappable"
          hover-class="notice-hover"
          @tap="goAdminPc('/team/notification')"
        >
          <view class="notice-alert">
            <text class="notice-exclaim">!</text>
          </view>
          <text class="notice-tip">点击查看最新公告</text>
          <view class="notice-fill" />
          <text class="notice-bell-outline" aria-hidden="true">🔔</text>
          <text class="notice-arrow">›</text>
        </view>

        <!-- 2×2 指标四宫格 -->
        <view v-if="metricRows.length" class="metrics-block">
          <view class="metric-grid">
            <view
              v-for="(m, i) in metricRows"
              :key="m.key || i"
              class="metric-top-card tappable"
              hover-class="metric-hover"
              @tap.stop="onMetricTap(m)"
            >
              <view class="mc-top-row">
                <text class="mc-title">{{ m.title }}</text>
                <text class="mc-all">{{ m.totalRight }}</text>
              </view>
              <view class="mc-mid">
                <text class="mc-count">{{ m.count }}</text>
                <text v-if="m.unit" class="mc-unit">{{ m.unit }}</text>
              </view>
              <view class="mc-compare">
                <text class="mc-cmp-label">相对于昨日</text>
                <text class="mc-cmp-val" :class="{ 'cmp-down': !m.compareUp }">
                  {{ m.compareDelta }}{{ m.compareUp ? "↑" : "↓" }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 快捷功能 -->
        <view class="quick-card">
          <text class="quick-title">快捷功能</text>
          <view class="quick-row">
            <view
              v-for="(q, qi) in quickEntries"
              :key="qi"
              class="quick-item tappable"
              hover-class="quick-hover"
              @tap="goAdminPc(q.path)"
            >
              <view class="quick-circle" :class="q.circleClass">
                <text class="quick-emo">{{ q.icon }}</text>
              </view>
              <text class="quick-label">{{ q.label }}</text>
            </view>
          </view>
        </view>

        <!-- 近七日趋势图 -->
        <HomeTrendChart
          :x-axis-data="xAxisData"
          :centre="centre"
          :prov="prov"
          :add-num="addNum"
          :integral="integral"
          :jd-data="JdData"
        />

        <!-- 月度成员排行 -->
        <DashboardAccountRanks
          :month-member-data="monthMemberData"
          @row-tap="onRankRowTap"
          @view-all="goAdminPc(ALIGNED_PC_HASH.TEAM_MEMBER)"
        />

        <!-- 待办事项 -->
        <DashboardTodo :todo-data="todoData" @changed="onTodoChanged" />

        <!-- 团队成员 -->
        <DashboardTeamMembers
          :team-top-list="teamTopList"
          @row-tap="onTeamRowTap"
          @view-all="goAdminPc(ALIGNED_PC_HASH.TEAM_MEMBER)"
        />

        <!-- 更新记录 -->
        <DashboardUpdateLog
          :update-top="updateTop"
          :version="appVersionName"
          @view-all="goAdminPc('/team/notification')"
        />

      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { onLoad, onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import { setTabBarPageIndex } from "@/utils/tabBarIndex";
import { getHomeData } from "@/api/home";
import { applyMockSessionFromQuery } from "@/utils/mockSession";
import { assertAuthedOrRedirectLogin } from "@/router/guard";
import { useUserStore } from "@/stores/user";
import { ALIGNED_PC_HASH, shopV2HashForPlatform } from "@/config/alignedPcRoutes";
import { devMockBaseURL, refreshDevMockConfig, applyBridgeEvent } from "@/config/devMock";
import { sanitizeMobileHomeTitle, useHomeDashboard } from "@/composables/useHomeDashboard";
import DashboardAccountRanks from "@/components/home/DashboardAccountRanks.vue";
import DashboardTeamMembers from "@/components/home/DashboardTeamMembers.vue";
import HomeTrendChart from "@/components/home/HomeTrendChart.vue";
import DashboardTodo from "@/components/home/DashboardTodo.vue";
import DashboardUpdateLog from "@/components/home/DashboardUpdateLog.vue";

function goAdminPc(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  uni.navigateTo({
    url: `/pages/admin-pc/admin-pc?path=${encodeURIComponent(p)}`,
    fail: () => {
      uni.showToast({ title: "暂无法打开该功能", icon: "none" });
    },
  });
}

/** 快捷入口：聚合客服 + 常用功能 */
type QuickEntry = { label: string; path: string; icon: string; circleClass: string };
const quickEntries: readonly QuickEntry[] = [
  { label: "聚合客服", path: ALIGNED_PC_HASH.CUSTOMER_SERVICE_CHAT, icon: "🦊", circleClass: "fox" },
  { label: "门店管理", path: ALIGNED_PC_HASH.SHOP_V2_FUNCTIONAL, icon: "🏪", circleClass: "shop" },
  { label: "团队成员", path: ALIGNED_PC_HASH.TEAM_MEMBER, icon: "👥", circleClass: "team" },
  { label: "数据大屏", path: ALIGNED_PC_HASH.DATA_SCREEN, icon: "📊", circleClass: "chart" },
];

onLoad((opts) => {
  applyMockSessionFromQuery(opts as Record<string, string | undefined>);
});

const {
  topData,
  monthMemberData,
  teamTopList,
  applyPayload,
  xAxisData,
  centre,
  prov,
  addNum,
  integral,
  JdData,
  todoData,
  updateTop,
} = useHomeDashboard();

const appVersionName = "1.0.0";

const userStore = useUserStore();

const displayName = computed(() => {
  const n = userStore.username.value;
  return n && n !== "游客" ? n : "用户";
});

const avatarLetter = computed(() => {
  const n = displayName.value;
  return n.charAt(0).toUpperCase() || "U";
});

function onTodoChanged() {
  void load();
}

function onRankRowTap(row: unknown) {
  const r = row as Record<string, unknown>;
  const memberId = r.member_id || r.admin;
  if (memberId) {
    goAdminPc(`${ALIGNED_PC_HASH.TEAM_MEMBER}`);
  } else {
    goAdminPc(ALIGNED_PC_HASH.TEAM_MEMBER);
  }
}

function onTeamRowTap(_row: unknown) {
  goAdminPc(ALIGNED_PC_HASH.TEAM_MEMBER);
}

let sseInstance: { close: () => void } | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let bridgePollTimer: ReturnType<typeof setInterval> | null = null;

function envMockFlagOn(): boolean {
  const v = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase();
  return v === "true" || v === "1";
}

function supportsEventSource(): boolean {
  return typeof window !== "undefined" && typeof EventSource !== "undefined";
}

function subscribeRealtime() {
  if (!supportsEventSource()) return;
  if (sseInstance) return;
  try {
    const es = new EventSource(`${devMockBaseURL()}/seed/events`);
    const reloadDebounced = () => {
      if (pendingTimer) return;
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        void load();
      }, 600);
    };
    es.addEventListener("hello", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data);
        applyBridgeEvent("hello", d);
      } catch { /* ignore */ }
    });
    es.addEventListener("mode", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data);
        applyBridgeEvent("mode", d);
        reloadDebounced();
      } catch { /* ignore */ }
    });
    es.addEventListener("change", reloadDebounced);
    es.addEventListener("clear", reloadDebounced);
    es.addEventListener("reset", reloadDebounced);
    sseInstance = es as unknown as { close: () => void };
  } catch { /* ignore */ }
}

function startBridgeRealtimeSync() {
  subscribeRealtime();
  if (supportsEventSource() || !envMockFlagOn()) return;
  if (bridgePollTimer) return;
  bridgePollTimer = setInterval(() => {
    void refreshDevMockConfig().then(() => void load());
  }, 15000);
}

onBeforeUnmount(() => {
  if (sseInstance) {
    try { sseInstance.close(); } catch { /* ignore */ }
    sseInstance = null;
  }
  if (pendingTimer) clearTimeout(pendingTimer);
  if (bridgePollTimer) {
    clearInterval(bridgePollTimer);
    bridgePollTimer = null;
  }
});

const loading = ref(false);
const error = ref("");
let loadSeq = 0;

const METRIC_KEY_ORDER = ["member_today", "integral_today", "mt_shop_today", "elm_shop_today"] as const;

type MetricRow = {
  key: string;
  dataType: number;
  title: string;
  count: string;
  unit: string;
  totalRight: string;
  compareDelta: string;
  compareUp: boolean;
  target: { type: "stores" | "users" | "todos"; platform?: string } | undefined;
};

function formatYdayDelta(raw: unknown): { text: string; up: boolean } {
  if (raw === undefined || raw === null || raw === "") return { text: "0", up: true };
  const n = Number(raw);
  if (!Number.isNaN(n)) return { text: String(Math.abs(n)), up: n >= 0 };
  const s = String(raw).trim();
  const neg = /^[-−]/.test(s) || s.includes("下降") || s.includes("减少");
  const digits = s.replace(/[^\d.-]/g, "");
  const num = Number(digits);
  if (!Number.isNaN(num)) return { text: String(Math.abs(num)), up: !neg && num >= 0 };
  return { text: s || "0", up: !neg };
}

const metricRows = computed(() => {
  const rows: MetricRow[] = topData.value.map((row) => {
    const dt = Number((row as any).data_type ?? 0);
    const title = sanitizeMobileHomeTitle(
      String((row as any).title ?? (row as any).name ?? (row as any).key ?? ""),
    );
    const count =
      (row as any).count !== undefined && (row as any).count !== null
        ? String((row as any).count)
        : "—";
    const unit = String((row as any).unit ?? (row as any).suffix ?? "");
    const allRaw = (row as any).all_total;
    const allNum =
      allRaw !== undefined && allRaw !== null
        ? Number(allRaw)
        : Number((row as any).count) || 0;
    const totalRight = `全部${allNum}${unit || ""}`;
    const y = formatYdayDelta((row as any).of_yday);
    return {
      key: String((row as any).key),
      dataType: dt,
      title,
      count,
      unit,
      totalRight,
      compareDelta: y.text,
      compareUp: y.up,
      target: (row as any).target as
        | { type: "stores" | "users" | "todos"; platform?: string }
        | undefined,
    };
  });
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const ordered: MetricRow[] = [];
  for (const k of METRIC_KEY_ORDER) {
    const x = byKey.get(k);
    if (x) ordered.push(x);
  }
  for (const r of rows) {
    if (!(METRIC_KEY_ORDER as readonly string[]).includes(r.key)) ordered.push(r);
  }
  return ordered.slice(0, 4);
});

const FALLBACK_METRIC_TARGET: Record<
  string,
  { type: "stores" | "users" | "todos"; platform?: string }
> = {
  mt_shop_today: { type: "stores", platform: "mt-shop-feature" },
  elm_shop_today: { type: "stores", platform: "elm-shop-feature" },
  member_today: { type: "users" },
  integral_today: { type: "users" },
};

function onMetricTap(m: { key: string; target?: { type: string; platform?: string } }) {
  const t = m.target || FALLBACK_METRIC_TARGET[m.key];
  if (!t) return;
  if (t.type === "stores") {
    goAdminPc(shopV2HashForPlatform(t.platform));
    return;
  }
  if (t.type === "users") {
    const isIntegral = String(m.key).includes("integral");
    goAdminPc(isIntegral ? ALIGNED_PC_HASH.TEAM_POINT : ALIGNED_PC_HASH.TEAM_MEMBER);
    return;
  }
  if (t.type === "todos") {
    goAdminPc(ALIGNED_PC_HASH.USER_OPERATE_TODOS);
    return;
  }
}

async function load() {
  if (!assertAuthedOrRedirectLogin()) {
    loading.value = false;
    return;
  }
  const seq = ++loadSeq;
  loading.value = true;
  error.value = "";
  try {
    await userStore.getUserInfo({ silent: true });
    const res = (await getHomeData()) as { code?: number; data?: Record<string, unknown> };
    const ok = res.code === 200 || res.code === 0 || Number(res.code) === 200;
    if (!ok || !res.data) throw new Error("首页数据为空（/homedata/v2/gethomedata）");
    if (seq !== loadSeq) return;
    applyPayload(res.data);
  } catch (e: unknown) {
    if (seq !== loadSeq) return;
    if (e instanceof Error) error.value = e.message;
    else if (e && typeof e === "object" && "errMsg" in e)
      error.value = String((e as { errMsg?: string }).errMsg || "加载失败");
    else error.value = typeof e === "string" ? e : JSON.stringify(e);
    if (!error.value || error.value === "{}") error.value = "加载失败";
  } finally {
    if (seq === loadSeq) loading.value = false;
  }
}

onShow(async () => {
  setTabBarPageIndex(0);
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as unknown as {
    options?: Record<string, string | undefined>;
  };
  applyMockSessionFromQuery(cur?.options);
  await refreshDevMockConfig();
  void load();
  startBridgeRealtimeSync();
});

onPullDownRefresh(() => {
  void (async () => {
    try {
      await load();
    } finally {
      uni.stopPullDownRefresh();
    }
  })();
});
</script>

<style scoped>
.page {
  height: 100%;
  min-height: 0;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  font-size: 26rpx;
  background: linear-gradient(180deg, #fff9e8 0%, #fff4dc 8%, #f4f6fa 160rpx);
  background-color: #f4f6fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.index-dashboard-shell {
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  box-sizing: border-box;
  padding: calc(12rpx + env(safe-area-inset-top)) 20rpx 28rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}
/* 顶部用户信息头 */
.page-hdr {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 4rpx 20rpx;
}
.hdr-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}
.hdr-brand {
  font-size: 42rpx;
  font-weight: 800;
  color: #1a1a2e;
  letter-spacing: 2rpx;
  line-height: 1.2;
}
.hdr-welcome {
  font-size: 24rpx;
  color: #909399;
  line-height: 1.3;
}
.hdr-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #e6b422 0%, #f07c32 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(230, 180, 34, 0.4);
}
.hdr-avatar-hover {
  opacity: 0.88;
  transform: scale(0.96);
}
.avatar-letter {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
/* 通知栏 */
.notice-strip {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx 24rpx;
  min-height: 88rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fff4d6 0%, #fff9e8 100%);
  border-radius: 20rpx;
  border: 1rpx solid rgba(230, 180, 34, 0.22);
}
.notice-hover {
  opacity: 0.9;
}
.notice-alert {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: #fff4dd;
  border: 1rpx solid rgba(230, 130, 40, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notice-exclaim {
  font-size: 32rpx;
  font-weight: 800;
  color: #e67e22;
  line-height: 1;
}
.notice-tip {
  font-size: 26rpx;
  color: #7a6030;
  margin-left: 16rpx;
  flex: 1;
  min-width: 0;
}
.notice-fill {
  flex: 0 0 8rpx;
}
.notice-bell-outline {
  font-size: 38rpx;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.9;
}
.notice-arrow {
  font-size: 36rpx;
  color: #c8960a;
  line-height: 1;
  margin-left: 8rpx;
  flex-shrink: 0;
}
.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 28rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 28rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.04);
}
.card.muted,
.card.err {
  font-size: 28rpx;
  color: #666;
}
.card.err { color: #c0392b; line-height: 1.55; }
.err-card { display: flex; flex-direction: column; align-items: stretch; gap: 24rpx; }
.err-msg { font-size: 28rpx; line-height: 1.5; }
.retry-btn {
  border-radius: 16rpx;
  font-size: 28rpx;
  background: #409eff;
  color: #fff;
}
.load-hint { text-align: center; padding: 48rpx 24rpx !important; margin-bottom: 24rpx; }
/* 指标四宫格 */
.metrics-block { margin-bottom: 20rpx; }
.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  align-items: stretch;
}
.metric-top-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 220rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.06);
  padding: 18rpx 16rpx 14rpx;
  box-sizing: border-box;
  background: #fff;
  overflow: hidden;
}
.mc-top-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8rpx;
}
.mc-title { flex: 1; min-width: 0; font-size: 24rpx; color: #303133; font-weight: 600; line-height: 1.25; }
.mc-all { flex-shrink: 0; font-size: 20rpx; color: #909399; line-height: 1.2; white-space: nowrap; font-weight: 400; }
.mc-mid { margin-top: 12rpx; flex: 1 1 auto; display: flex; flex-direction: row; align-items: baseline; flex-wrap: wrap; }
.mc-count { font-size: 48rpx; font-weight: 700; color: #1c1c28; line-height: 1.1; }
.mc-unit { font-size: 22rpx; color: #606266; margin-left: 6rpx; font-weight: 500; }
.mc-compare { margin-top: auto; padding-top: 10rpx; display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: 4rpx 6rpx; }
.mc-cmp-label { font-size: 20rpx; color: #a8abb2; line-height: 1.3; }
.mc-cmp-val { font-size: 22rpx; font-weight: 500; color: #67c23a; line-height: 1.3; }
.mc-cmp-val.cmp-down { color: #f56c6c; }
/* 快捷功能 */
.quick-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.04);
  box-sizing: border-box;
}
.quick-title { display: block; font-size: 28rpx; font-weight: 600; color: #1c1c28; margin-bottom: 20rpx; }
.quick-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24rpx 0;
  width: 100%;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  padding: 8rpx 4rpx;
  box-sizing: border-box;
}
.quick-circle {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.18);
}
.quick-circle.fox { background: linear-gradient(145deg, #ff9f43 0%, #ff6b35 100%); box-shadow: 0 8rpx 24rpx rgba(255, 149, 0, 0.35); }
.quick-circle.shop { background: linear-gradient(145deg, #43d8a4 0%, #0dbf7e 100%); box-shadow: 0 8rpx 24rpx rgba(13, 191, 126, 0.32); }
.quick-circle.team { background: linear-gradient(145deg, #4da3ff 0%, #2d6cdf 100%); box-shadow: 0 8rpx 24rpx rgba(45, 108, 223, 0.32); }
.quick-circle.chart { background: linear-gradient(145deg, #bc6aff 0%, #8e44ad 100%); box-shadow: 0 8rpx 24rpx rgba(142, 68, 173, 0.32); }
.quick-emo { font-size: 52rpx; line-height: 1; }
.quick-hover { opacity: 0.85; transform: scale(0.97); }
.quick-label { margin-top: 12rpx; font-size: 24rpx; color: #606266; }
/* 通用 */
.tappable { cursor: pointer; }
.metric-hover { opacity: 0.94; }
</style>
