<template>
  <!-- #ifdef H5 -->
  <view class="shell">
    <view class="toolbar">
      <button class="back" size="mini" @click="goBack">返回</button>
      <text class="title">完整后台</text>
    </view>
    <web-view class="wv" :src="embedUrl" />
  </view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="shell pad">
    <text class="tip">内嵌完整后台仅支持 H5 浏览器。小程序/App 请使用电脑浏览器打开 PC 后台。</text>
    <button class="ghost" @click="goBack">返回</button>
  </view>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { buildPcAdminEmbedUrl } from "@/utils/pcAdminEmbed";

const embedUrl = ref("");

onLoad((opts) => {
  // #ifdef H5
  const raw = (opts?.path || opts?.p || "/index") as string;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    path = raw;
  }
  embedUrl.value = buildPcAdminEmbedUrl(path);
  // #endif
});

function goBack() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: "/pages/index/index" }) });
}
</script>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  background: #1c1c28;
}
.toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 20rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: #1c1c28;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}
.back {
  flex-shrink: 0;
}
.title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  text-align: center;
  padding-right: 120rpx;
  box-sizing: border-box;
}
.wv {
  flex: 1;
  width: 100%;
  min-height: 0;
}
.pad {
  padding: 40rpx 32rpx;
  background: #f5f6fa;
  justify-content: center;
}
.tip {
  font-size: 28rpx;
  color: #444;
  line-height: 1.6;
  margin-bottom: 32rpx;
}
.ghost {
  background: #fff;
  color: #2d6cdf;
  border: 1rpx solid #c8d6f5;
  border-radius: 16rpx;
}
</style>
