<template>
  <view class="page">
    <view class="index-dashboard-shell">
      <view v-if="loading" class="card muted load-hint">加载中…</view>
      <view v-else-if="error" class="card err err-card">
        <text class="err-msg">{{ error }}</text>
        <button class="retry-btn" @tap="load">重试</button>
      </view>
      <template v-else>
        <view class="notice-strip">
          <view class="notice-alert">
            <text class="notice-exclaim">!</text>
          </view>
          <view class="notice-fill" />
          <text class="notice-bell-outline" aria-hidden="true">🔔</text>
        </view>

        <!-- 今日指标：2×2 与参考稿一致；仅今日数 + 右上累计，无任何「相较于昨日」 -->
        <view v-if="metricRows.length" class="metrics-block">
          <view class="metric-grid">
            <view
              v-for="(m, i) in metricRows"
              :key="m.key || i"
              class="metric-top-card tappable"
              :class="'dt-' + m.dataType"
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
              <text class="mc-watermark">{{ m.wm }}</text>
            </view>
          </view>
        </view>

        <view class="quick-card">
          <text class="quick-title">快捷功能</text>
          <view class="quick-row">
            <view class="quick-item" hover-class="quick-hover" @tap="openAggregatedService">
              <view class="quick-circle fox">
                <text class="fox-emo">🦊</text>
              </view>
              <text class="quick-label">聚合客服</text>
            </view>
          </view>
        </view>

        <DashboardAccountRanks :month-member-data="monthMemberData" />

        <DashboardTeamChart :team-top-list="teamTopList" />
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
import DashboardTeamChart from "@/components/home/DashboardTeamChart.vue";

function goAdminPc(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  // #ifdef H5
  uni.navigateTo({
    url: `/pages/admin-pc/admin-pc?path=${encodeURIComponent(p)}`,
    fail: () => {},
  });
  // #endif
  // #ifndef H5
  uni.showToast({ title: "请在 H5 中打开完整后台", icon: "none" });
  // #endif
}

function openAggregatedService() {
  goAdminPc(ALIGNED_PC_HASH.CUSTOMER_SERVICE_CHAT);
}

onLoad((opts) => {
  applyMockSessionFromQuery(opts as Record<string, string | undefined>);
});

const {
  topData,
  monthMemberData,
  teamTopList,
  applyPayload,
} = useHomeDashboard();

let sseInstance: { close: () => void } | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function subscribeRealtime() {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
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
      } catch {
        /* ignore */
      }
    });
    es.addEventListener("mode", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data);
        applyBridgeEvent("mode", d);
        reloadDebounced();
      } catch {
        /* ignore */
      }
    });
    es.addEventListener("change", reloadDebounced);
    es.addEventListener("clear", reloadDebounced);
    es.addEventListener("reset", reloadDebounced);
    sseInstance = es as unknown as { close: () => void };
  } catch {
    /* ignore */
  }
}

onBeforeUnmount(() => {
  if (sseInstance) {
    try {
      sseInstance.close();
    } catch {
      /* ignore */
    }
    sseInstance = null;
  }
  if (pendingTimer) clearTimeout(pendingTimer);
});

const userStore = useUserStore();
const loading = ref(false);
const error = ref("");
let loadSeq = 0;

const WM_BY_TYPE: Record<number, string> = {
  200: "员",
  100: "分",
  1: "店",
  2: "店",
};

const metricRows = computed(() => {
  return topData.value.map((row) => {
    const dt = Number((row as any).data_type ?? 0);
    const title = sanitizeMobileHomeTitle(
      String((row as any).title ?? (row as any).name ?? (row as any).key ?? ""),
    );
    const count = (row as any).count !== undefined && (row as any).count !== null ? String((row as any).count) : "—";
    const unit = String((row as any).unit ?? (row as any).suffix ?? "");
    const allRaw = (row as any).all_total;
    const allNum = allRaw !== undefined && allRaw !== null ? Number(allRaw) : Number((row as any).count) || 0;
    const totalRight = `全部${allNum}${unit || ""}`;
    return {
      key: String((row as any).key),
      dataType: dt,
      title,
      count,
      unit,
      totalRight,
      wm: WM_BY_TYPE[dt] || "数",
      target: (row as any).target as { type: "stores" | "users" | "todos"; platform?: string } | undefined,
    };
  });
});

const FALLBACK_METRIC_TARGET: Record<string, { type: "stores" | "users" | "todos"; platform?: string }> = {
  mt_shop_today: { type: "stores", platform: "mt-shop-feature" },
  elm_shop_today: { type: "stores", platform: "elm-shop-feature" },
  member_today: { type: "users" },
  integral_today: { type: "users" },
};

function onMetricTap(m: { key: string; target?: { type: string; platform?: string } }) {
  const t = m.target || FALLBACK_METRIC_TARGET[m.key];
  if (!t) {
    return;
  }
  // #ifdef H5
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
  // #endif
  const q: string[] = [`type=${encodeURIComponent(t.type)}`];
  if (t.platform) q.push(`platform=${encodeURIComponent(t.platform)}`);
  uni.navigateTo({ url: `/pages/seed-list/seed-list?${q.join("&")}` });
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
    if (res.code !== 200 || !res.data) {
      throw new Error("首页数据为空（/homedata/v2/gethomedata）");
    }
    if (seq !== loadSeq) return;
    applyPayload(res.data);
  } catch (e: unknown) {
    if (seq !== loadSeq) return;
    if (e instanceof Error) {
      error.value = e.message;
    } else if (e && typeof e === "object" && "errMsg" in e) {
      error.value = String((e as { errMsg?: string }).errMsg || "加载失败");
    } else {
      error.value = typeof e === "string" ? e : JSON.stringify(e);
    }
    if (!error.value || error.value === "{}") error.value = "加载失败";
  } finally {
    if (seq === loadSeq) {
      loading.value = false;
    }
  }
}

onShow(async () => {
  setTabBarPageIndex(0);
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as unknown as { options?: Record<string, string | undefined> };
  applyMockSessionFromQuery(cur?.options);
  await refreshDevMockConfig();
  void load();
  /* 与 PC 首页一致：始终订阅 bridge SSE，用于 mode/clear/reset 及 mock 模式下的 change 实时刷新 */
  subscribeRealtime();
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
/* 外层固定为导航栏与 tabBar 之间的可视高度，禁止整页跟内容一起「长高」乱跑 */
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
/* 仅内容区滚动；底部留白避免被 tabBar 遮挡 */
.index-dashboard-shell {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  box-sizing: border-box;
  padding: calc(12rpx + env(safe-area-inset-top)) 20rpx 28rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}
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
.notice-alert {
  width: 64rpx;
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
  font-size: 34rpx;
  font-weight: 800;
  color: #e67e22;
  line-height: 1;
}
.notice-fill {
  flex: 1;
}
.notice-bell-outline {
  font-size: 40rpx;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.92;
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
.card.err {
  color: #c0392b;
  line-height: 1.55;
}
.err-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24rpx;
}
.err-msg {
  font-size: 28rpx;
  line-height: 1.5;
}
.retry-btn {
  border-radius: 16rpx;
  font-size: 28rpx;
  background: #409eff;
  color: #fff;
}
.load-hint {
  text-align: center;
  padding: 48rpx 24rpx !important;
  margin-bottom: 24rpx;
}
.metrics-block {
  margin-bottom: 24rpx;
}
.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}
.metric-top-card {
  position: relative;
  min-height: 200rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.06);
  padding: 18rpx 16rpx 16rpx;
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
.mc-title {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #303133;
  font-weight: 600;
  line-height: 1.25;
}
.mc-all {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #909399;
  line-height: 1.25;
  white-space: nowrap;
}
.quick-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.04);
  box-sizing: border-box;
}
.quick-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1c1c28;
  margin-bottom: 20rpx;
}
.quick-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 32rpx;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120rpx;
  padding: 8rpx;
  margin: -8rpx;
}
.quick-hover {
  opacity: 0.85;
}
.quick-circle {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 149, 0, 0.35);
}
.quick-circle.fox {
  background: linear-gradient(145deg, #ff9f43 0%, #ff6b35 100%);
}
.fox-emo {
  font-size: 56rpx;
  line-height: 1;
}
.quick-label {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #606266;
}
.mc-mid {
  margin-top: 14rpx;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;
}
.mc-count {
  font-size: 48rpx;
  font-weight: 700;
  color: #1c1c28;
  line-height: 1.1;
}
.mc-unit {
  font-size: 24rpx;
  color: #606266;
  margin-left: 8rpx;
  font-weight: 500;
}
.mc-watermark {
  position: absolute;
  right: 4rpx;
  bottom: -6rpx;
  font-size: 88rpx;
  font-weight: 800;
  color: rgba(48, 49, 51, 0.06);
  line-height: 1;
  pointer-events: none;
}
.tappable {
  cursor: pointer;
}
.metric-hover {
  opacity: 0.94;
}
.dt-1 .mc-watermark {
  color: rgba(255, 149, 0, 0.12);
}
.dt-2 .mc-watermark {
  color: rgba(0, 122, 255, 0.1);
}
.dt-200 .mc-watermark {
  color: rgba(155, 89, 182, 0.1);
}
.dt-100 .mc-watermark {
  color: rgba(241, 196, 15, 0.12);
}
</style>
