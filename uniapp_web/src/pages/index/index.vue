<template>
  <view class="page">
    <view class="head">
      <text class="greet">你好，默认测试账号</text>
      <text class="tip">纯静态首页 · 无接口请求 · 与 Mock 演示数据一致</text>
    </view>

    <view class="card">
      <view class="row">
        <text class="k">用户名</text>
        <text class="v">默认测试账号</text>
      </view>
      <view class="row">
        <text class="k">角色</text>
        <text class="v">静态占位 · 运营</text>
      </view>
      <view class="row">
        <text class="k">头像</text>
        <text class="v">—</text>
      </view>
      <view class="row">
        <text class="k">Token（演示）</text>
        <text class="v mono">uni-mock…oken</text>
      </view>
      <view class="row">
        <text class="k">说明</text>
        <text class="v small">以下为占位文案，不读取接口；若从带 mock 参数的链接进入，仍会同步写入本地 Mock 登录态。</text>
      </view>
    </view>

    <view class="card urls">
      <text class="url-title">手机浏览器 H5 测试</text>
      <text class="url-tip">开发服务已监听 0.0.0.0；请把下述地址中的主机名换为你电脑的局域网 IP（与终端端口一致）。</text>
      <view class="url-block">
        <text class="url-label">首页（可先免登写 Mock 态）</text>
        <text class="url-line" selectable>{{ homeWithMock }}</text>
      </view>
      <view class="url-block">
        <text class="url-label">本页静态地址</text>
        <text class="url-line" selectable>{{ homeStatic }}</text>
      </view>
    </view>

    <view class="actions">
      <button class="ghost" @click="goMine">我的</button>
      <button class="ghost" @click="goSample">分包示例</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { MOCK_SESSION_TOKEN } from "@/config/mockAuth";
import { applyMockSessionFromQuery } from "@/utils/mockSession";

/** 仍解析 URL 参数，便于手机打开带 mockBypass/mock_token 的链接时写入与网页一致的 Mock 态（同步、无网络） */
onLoad((opts) => {
  applyMockSessionFromQuery(opts as Record<string, string | undefined>);
});

const homeStatic = ref("");
const homeWithMock = ref("");

onShow(() => {
  const pages = getCurrentPages();
  const cur = pages[pages.length - 1] as unknown as {
    options?: Record<string, string | undefined>;
  };
  applyMockSessionFromQuery(cur?.options);
});

function buildOrigin(): string {
  /* #ifdef H5 */
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  /* #endif */
  return "";
}

function initUrls() {
  const origin = buildOrigin();
  if (!origin) {
    homeStatic.value = "（请在 H5 浏览器中打开以生成可复制地址）";
    homeWithMock.value = `（Mock 口令）mock_token=${MOCK_SESSION_TOKEN}`;
    return;
  }
  const base = `${origin}/#/pages/index/index`;
  homeStatic.value = base;
  homeWithMock.value = `${base}?mockBypass=1`;
}

initUrls();

function goMine() {
  uni.navigateTo({ url: "/pages/mine/mine" });
}

function goSample() {
  uni.navigateTo({ url: "/package-demo/pages/sample/sample" });
}
</script>

<style scoped>
/* 全 rpx：H5 手机与电脑同一套规则，随屏宽换算；宽屏居中避免卡片过散 */
.page {
  min-height: 100vh;
  width: 100%;
  max-width: 750rpx;
  margin: 0 auto;
  padding: 36rpx 32rpx 48rpx;
  box-sizing: border-box;
  background: #f5f6fa;
}
.head {
  margin-bottom: 36rpx;
}
.greet {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #1c1c28;
}
.tip {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #888;
  line-height: 1.55;
}
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 6rpx 28rpx rgba(0, 0, 0, 0.06);
}
.card.urls {
  padding: 36rpx 40rpx 40rpx;
  margin-bottom: 28rpx;
}
.url-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
  margin-bottom: 16rpx;
}
.url-tip {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 28rpx;
}
.url-block {
  margin-bottom: 28rpx;
}
.url-block:last-of-type {
  margin-bottom: 0;
}
.url-label {
  display: block;
  font-size: 24rpx;
  color: #888;
  margin-bottom: 10rpx;
}
.url-line {
  display: block;
  font-size: 22rpx;
  color: #2d6cdf;
  line-height: 1.65;
  word-break: break-all;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22rpx 0;
  min-height: 48rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.row:first-child {
  padding-top: 4rpx;
}
.row:last-child {
  border-bottom: none;
  padding-bottom: 4rpx;
}
.k {
  font-size: 26rpx;
  color: #888;
  flex-shrink: 0;
  margin-right: 28rpx;
  max-width: 220rpx;
}
.v {
  font-size: 28rpx;
  color: #222;
  text-align: right;
  flex: 1;
  word-break: break-all;
}
.v.small {
  font-size: 24rpx;
  color: #555;
  text-align: right;
  line-height: 1.55;
}
.v.mono {
  font-family: ui-monospace, monospace;
  font-size: 24rpx;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 8rpx;
}
/* 原默认约 28rpx，整体加大 4rpx（约两档常用步进），圆角胶囊；去 uni/button 默认描边 */
.ghost {
  margin-top: 0;
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 999rpx;
  background: #fff;
  color: #2d6cdf;
  border: 2rpx solid #c8d6f5;
  box-sizing: border-box;
}
.ghost::after {
  border: none;
}
</style>
