<template>
  <view class="page">
    <view class="card">
      <text class="name">{{ userStore.username }}</text>
      <text class="sub">已登录 · 与 PC 共用 token 存储键 shop-vite-token</text>
    </view>
    <button class="btn warn" @click="onLogout">退出登录</button>
    <button class="ghost" @click="goHome">回首页</button>
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { assertAuthedOrRedirectLogin } from "@/router/guard";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

onShow(() => {
  assertAuthedOrRedirectLogin();
});

async function onLogout() {
  await userStore.logout();
}

function goHome() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: "/pages/index/index" }) });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
  background: #f5f6fa;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 36rpx 28rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}
.name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1c1c28;
}
.sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #888;
  line-height: 1.5;
}
.btn {
  width: 100%;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}
.btn.warn {
  background: #e74c3c;
  color: #fff;
}
.ghost {
  width: 100%;
  background: #fff;
  color: #2d6cdf;
  border: 1rpx solid #d0d8f0;
  border-radius: 16rpx;
}
</style>
