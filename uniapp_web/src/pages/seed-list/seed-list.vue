<template>
  <view class="page">
    <view class="head">
      <text class="greet">{{ titleText }}</text>
      <view class="tip-row">
        <text class="tip">数据来源：dev-bridge /seed/{{ type }}{{ platform ? ' · 平台=' + platform : '' }}</text>
        <text class="live" :class="liveBadge">
          {{ liveBadge === 'live' ? '● 实时已连接' : liveBadge === 'connecting' ? '○ 连接中…' : liveBadge === 'off' ? '◆ Mock 已关闭' : '× 离线' }}
        </text>
      </view>
    </view>

    <view v-if="loading" class="card muted">加载中…</view>
    <view v-else-if="error" class="card err">{{ error }}</view>

    <view v-else-if="rows.length === 0" class="card muted">暂无数据</view>

    <view v-else class="card">
      <text class="card-title">共 {{ rows.length }} 条</text>

      <!-- stores 行 -->
      <template v-if="type === 'stores'">
        <view v-for="(r, i) in rows" :key="r.shop_id || i" class="row">
          <view class="row-main">
            <text class="row-title">{{ r.shop_name }}</text>
            <text class="row-sub">{{ r.platform_title }} · {{ r.status === 1 ? '在线' : '停用' }}</text>
            <text v-if="r.address" class="row-extra">{{ r.address }}</text>
          </view>
          <text v-if="r.__mock" class="tag tag-mock">Mock</text>
        </view>
      </template>

      <!-- users 行 -->
      <template v-else-if="type === 'users'">
        <view v-for="(r, i) in rows" :key="r.id || i" class="row">
          <view class="row-main">
            <text class="row-title">{{ r.user_name }}</text>
            <text class="row-sub">{{ r.role }} · {{ r.shop_name }}</text>
            <text v-if="r.phone" class="row-extra">余额 {{ Number(r.balance || 0).toFixed(2) }} · 积分 {{ r.integral || 0 }}</text>
          </view>
          <text v-if="r.__mock" class="tag tag-mock">Mock</text>
        </view>
      </template>

      <!-- todos 行 -->
      <template v-else-if="type === 'todos'">
        <view v-for="(r, i) in rows" :key="r.id || i" class="row">
          <view class="row-main">
            <text class="row-title">{{ r.title }}</text>
            <text class="row-sub">{{ r.status === 1 ? '已完成' : '待办' }} · 截止 {{ r.due || '—' }}</text>
            <text class="row-extra">负责人 #{{ r.user_id }}</text>
          </view>
          <text v-if="r.__mock" class="tag tag-mock">Mock</text>
        </view>
      </template>
    </view>

    <view class="actions">
      <button class="ghost" @click="onBack">返回首页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { fetchStores, fetchTodos, fetchUsers, type DevStore, type DevTodo, type DevUser } from "@/api/seed";
import { applyBridgeEvent, devMockBaseURL, isDevMockOn, refreshDevMockConfig } from "@/config/devMock";

type SeedType = "stores" | "users" | "todos";

const type = ref<SeedType>("stores");
const platform = ref<string>("");
const loading = ref(true);
const error = ref("");
const rows = ref<any[]>([]);
const liveBadge = ref<"connecting" | "live" | "offline" | "off">(isDevMockOn() ? "connecting" : "off");

const titleText = computed(() => {
  if (type.value === "stores") return platform.value ? `${platform.value} 门店` : "门店列表";
  if (type.value === "users") return "用户列表";
  return "待办列表";
});

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let sseInstance: { close: () => void } | null = null;

const MAX_LOAD_RETRIES = 3;

async function loadOnce() {
  if (type.value === "stores") {
    const r = await fetchStores();
    const list = (r.data || []) as DevStore[];
    rows.value = platform.value ? list.filter((s) => s.platform_type === platform.value) : list;
  } else if (type.value === "users") {
    const r = await fetchUsers();
    rows.value = (r.data?.list || []) as DevUser[];
  } else {
    const r = await fetchTodos();
    rows.value = (r.data || []) as DevTodo[];
  }
}

async function load() {
  loading.value = true;
  error.value = "";
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_LOAD_RETRIES; attempt++) {
    try {
      await loadOnce();
      loading.value = false;
      return;
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_LOAD_RETRIES) {
        uni.showToast({
          title: `第 ${attempt} 次请求失败，${attempt + 1}/${MAX_LOAD_RETRIES} 次重试…`,
          icon: "none",
          duration: 1400,
        });
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  loading.value = false;
  error.value = lastErr instanceof Error ? lastErr.message : "加载失败";
}

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
      }, 400);
    };
    es.addEventListener("hello", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data);
        applyBridgeEvent("hello", d);
        liveBadge.value = isDevMockOn() ? "live" : "off";
      } catch {
        liveBadge.value = "live";
      }
    });
    es.addEventListener("mode", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data);
        applyBridgeEvent("mode", d);
        liveBadge.value = isDevMockOn() ? "live" : "off";
        reloadDebounced();
      } catch {
        /* ignore */
      }
    });
    es.addEventListener("change", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data) as { resource: string };
        if (d && d.resource === type.value) reloadDebounced();
      } catch {
        reloadDebounced();
      }
    });
    es.addEventListener("clear", reloadDebounced);
    es.addEventListener("reset", reloadDebounced);
    es.onerror = () => {
      liveBadge.value = "offline";
    };
    sseInstance = es as unknown as { close: () => void };
  } catch {
    liveBadge.value = "offline";
  }
}

onLoad((opts: Record<string, string | undefined> = {}) => {
  const t = String(opts.type || "stores").toLowerCase();
  type.value = (t === "users" || t === "todos") ? (t as SeedType) : "stores";
  platform.value = String(opts.platform || "").trim();
});

onShow(async () => {
  await refreshDevMockConfig();
  void load();
  subscribeRealtime();
});

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

function onBack() {
  uni.navigateBack({ delta: 1 });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 32rpx 28rpx 56rpx;
  box-sizing: border-box;
  background: #f4f6fa;
}
.head {
  margin-bottom: 28rpx;
}
.greet {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  color: #1c1c28;
  letter-spacing: 0.5rpx;
}
.tip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  gap: 16rpx;
  flex-wrap: wrap;
}
.tip {
  font-size: 24rpx;
  color: #888;
  flex: 1;
}
.live {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}
.live.live { color: #1c8c2c; background: #e6f7ea; }
.live.connecting { color: #b07105; background: #fff7e0; }
.live.offline { color: #b3261e; background: #fde7e7; }
.live.off { color: #565a73; background: #ebedf3; }

.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx 28rpx 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 28rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.04);
}
.card.muted, .card.err {
  font-size: 28rpx;
  color: #666;
  padding: 36rpx 32rpx;
}
.card.err { color: #c0392b; line-height: 1.55; }
.card-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 16rpx;
  letter-spacing: 0.3rpx;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.row:last-child { border-bottom: none; }
.row-main { flex: 1; min-width: 0; }
.row-title {
  display: block;
  font-size: 30rpx;
  color: #1c1c28;
  font-weight: 600;
  margin-bottom: 6rpx;
  word-break: break-all;
}
.row-sub {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 4rpx;
}
.row-extra {
  display: block;
  font-size: 22rpx;
  color: #9ca0ad;
}
.tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}
.tag-mock {
  color: #b07105;
  background: #fff7e0;
}
.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}
.actions .ghost {
  background: #fff;
  color: #2d6cdf;
  border: 1rpx solid rgba(45, 108, 223, 0.3);
  border-radius: 16rpx;
  padding: 18rpx 28rpx;
  font-size: 26rpx;
}
</style>
