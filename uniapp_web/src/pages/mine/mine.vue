<template>
  <view class="page">
    <view class="head-row">
      <text class="head-title">账号概览</text>
      <view class="head-actions">
        <text class="head-ico">👤</text>
        <text class="head-ico">⊞</text>
      </view>
    </view>

    <view class="profile-block">
      <image class="avatar" :src="displayAvatar" mode="aspectFill" />
      <view class="profile-text">
        <text class="uname">{{ displayName }}</text>
        <text class="phone">手机号：{{ admin.phone || "—" }}</text>
      </view>
    </view>

    <view class="stat-grid">
      <view class="stat-card purple">
        <text class="stat-num">{{ idText }}</text>
        <text class="stat-lab">账号ID</text>
      </view>
      <view class="stat-card pink">
        <text class="stat-num">{{ codeText }}</text>
        <text class="stat-lab">邀请码</text>
      </view>
      <view class="stat-card blue">
        <text class="stat-num">{{ teamIdText }}</text>
        <text class="stat-lab">团队ID</text>
      </view>
      <view class="stat-card yellow">
        <text class="stat-num">{{ balanceText }}</text>
        <text class="stat-lab">剩余积分</text>
      </view>
    </view>

    <text class="sec-title">门店数量统计</text>
    <view class="store-row">
      <view class="store-mini">
        <image class="plat-ico" src="/static/home/mt-brand.svg" mode="aspectFit" />
        <text class="store-n">{{ mtShopCount }}</text>
        <text class="store-lab">美团餐饮</text>
      </view>
      <view class="store-mini">
        <image class="plat-ico jd" src="/static/home/integral-brand.svg" mode="aspectFit" />
        <text class="store-n">{{ jdShopCount }}</text>
        <text class="store-lab">京东到家</text>
      </view>
    </view>

    <text class="sec-title">团队管理</text>
    <view class="menu-card">
      <view class="menu-item" @tap="goPc(ALIGNED_PC_HASH.TEAM_POINT)">
        <view class="menu-ico orange" />
        <text class="menu-t">积分管理</text>
        <text class="menu-ar">›</text>
      </view>
      <view class="menu-item" @tap="goPc(ALIGNED_PC_HASH.TEAM_GROUP)">
        <view class="menu-ico purple" />
        <text class="menu-t">门店分组管理</text>
        <text class="menu-ar">›</text>
      </view>
      <view class="menu-item" @tap="goPc(ALIGNED_PC_HASH.TEAM_MEMBER)">
        <view class="menu-ico tan" />
        <text class="menu-t">团队成员管理</text>
        <text class="menu-ar">›</text>
      </view>
      <view class="menu-item" @tap="onFeedback">
        <view class="menu-ico green" />
        <text class="menu-t">意见反馈</text>
        <text class="menu-ar">›</text>
      </view>
    </view>

    <button class="logout" @click="onLogout">退出当前账号</button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { assertAuthedOrRedirectLogin } from "@/router/guard";
import { setTabBarPageIndex } from "@/utils/tabBarIndex";
import { ALIGNED_PC_HASH } from "@/config/alignedPcRoutes";
import { useUserStore } from "@/stores/user";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { isArray, isString } from "@/utils/validate";

type AdminShape = {
  user_name?: string;
  avatar?: string;
  role?: unknown;
  notes?: string;
  id?: number;
  phone?: string;
  balance?: string | number;
  code?: string;
  shop_id?: number;
  agency_id?: number;
  team_id?: number;
};

const userStore = useUserStore();
const admin = reactive<AdminShape>({});

function readUserInfoCache() {
  try {
    const raw = uni.getStorageSync("userInfo");
    if (!raw || typeof raw !== "string") return;
    const data = JSON.parse(raw) as { admin?: AdminShape };
    const a = data.admin;
    if (!a) return;
    Object.assign(admin, a);
    if (a.user_name && isString(a.user_name)) userStore.setUsername(a.user_name);
    if (a.avatar != null && isString(a.avatar)) userStore.setAvatar(a.avatar);
    if (a.role && isArray(a.role)) {
      userStore.roles.value = a.role.filter((r): r is string => isString(r));
    }
  } catch {
    /* ignore */
  }
}

const displayName = computed(() => admin.user_name || userStore.username.value || "—");
const displayAvatar = computed(() => {
  const fromStore = resolveMediaUrl(userStore.avatar.value);
  if (fromStore) return fromStore;
  const fromAdmin = resolveMediaUrl(admin.avatar);
  if (fromAdmin) return fromAdmin;
  return "/static/tab/mine.png";
});

const idText = computed(() => String(admin.id ?? "—"));
const codeText = computed(() => String(admin.code ?? admin.id ?? "—"));
const teamIdText = computed(() =>
  String(admin.team_id ?? admin.agency_id ?? admin.shop_id ?? admin.id ?? "—"),
);
const balanceText = computed(() => {
  const b = admin.balance;
  if (b === undefined || b === null || b === "") return "0.0";
  return String(b);
});

/** 占位：真实门店分平台统计需单独接口，联调阶段由 homedata 种子或后续接口补齐 */
const mtShopCount = computed(() => "—");
const jdShopCount = computed(() => "—");

function goPc(hashPath: string) {
  const p = hashPath.startsWith("/") ? hashPath : `/${hashPath}`;
  // #ifdef H5
  uni.navigateTo({
    url: `/pages/admin-pc/admin-pc?path=${encodeURIComponent(p)}`,
    fail: () => {
      /* 静默，避免打断操作流 */
    },
  });
  // #endif
  // #ifndef H5
  uni.showToast({ title: "请在 H5 中打开", icon: "none" });
  // #endif
}

function onFeedback() {
  uni.showToast({ title: "请在 PC 端意见反馈或联系管理员", icon: "none" });
}

onShow(() => {
  setTabBarPageIndex(3);
  if (!assertAuthedOrRedirectLogin()) return;
  readUserInfoCache();
  void userStore.getUserInfo().then(() => readUserInfoCache());
});

async function onLogout() {
  await userStore.logout();
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #faf8f2;
}
.head-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}
.head-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
}
.head-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a2e;
}
.head-ico {
  font-size: 36rpx;
  line-height: 1;
}
.profile-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 28rpx;
}
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #eee;
}
.profile-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.uname {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a2e;
}
.phone {
  font-size: 26rpx;
  color: #606266;
}
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.stat-card {
  border-radius: 16rpx;
  padding: 22rpx 18rpx;
  box-sizing: border-box;
  min-height: 120rpx;
}
.stat-card.purple {
  background: linear-gradient(135deg, #a29bfe 0%, #7c6feb 100%);
}
.stat-card.pink {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
}
.stat-card.blue {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}
.stat-card.yellow {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
}
.stat-num {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.stat-card.yellow .stat-num {
  color: #2d3436;
}
.stat-lab {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.92);
}
.stat-card.yellow .stat-lab {
  color: rgba(45, 52, 54, 0.85);
}
.sec-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 16rpx;
}
.store-row {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.store-mini {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}
.plat-ico {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 8rpx;
}
.plat-ico.jd {
  opacity: 0.9;
}
.store-n {
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a2e;
}
.store-lab {
  font-size: 22rpx;
  color: #909399;
  margin-top: 4rpx;
}
.menu-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  gap: 20rpx;
}
.menu-ico {
  width: 36rpx;
  height: 36rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}
.menu-ico.orange {
  background: linear-gradient(145deg, #ff9f43, #ff6b35);
}
.menu-ico.purple {
  background: linear-gradient(145deg, #a29bfe, #6c5ce7);
}
.menu-ico.tan {
  background: linear-gradient(145deg, #dcb896, #b08968);
}
.menu-ico.green {
  background: linear-gradient(145deg, #55efc4, #00b894);
}
.menu-t {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #303133;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-ar {
  font-size: 36rpx;
  color: #c0c4cc;
  font-weight: 300;
}
.logout {
  width: 100%;
  background: #fff;
  color: #1a1a2e;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 16rpx;
  font-size: 30rpx;
  padding: 22rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
</style>
