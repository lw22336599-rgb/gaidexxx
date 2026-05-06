<template>
  <!-- #ifdef H5 -->
  <view class="shell">
    <view class="toolbar toolbar-dark">
      <button class="back" size="mini" @click="goBack">返回</button>
      <text class="title title-light">完整后台</text>
    </view>
    <web-view class="wv" :src="embedUrl" />
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN || APP-PLUS -->
  <view class="shell shell-embed">
    <view class="toolbar toolbar-dark">
      <button class="back" size="mini" @click="goBack">返回</button>
      <text class="title title-light">完整后台</text>
    </view>
    <web-view class="wv wv-embed" :src="embedUrl" />
  </view>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <!-- #ifndef MP-WEIXIN -->
  <!-- #ifndef APP-PLUS -->
  <view class="shell pad">
    <text class="tip">当前平台暂不支持内嵌后台，请使用微信 / App / 浏览器 H5。</text>
    <button class="ghost" @click="goBack">返回</button>
  </view>
  <!-- #endif -->
  <!-- #endif -->
  <!-- #endif -->
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { buildPcAdminEmbedUrl } from "@/utils/pcAdminEmbed";

const embedUrl = ref("");

onLoad((opts) => {
  const raw = (opts?.path || opts?.p || "/index") as string;
  let path = raw;
  try {
    path = decodeURIComponent(raw);
  } catch {
    path = raw;
  }
  embedUrl.value = buildPcAdminEmbedUrl(path);
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
.shell-embed {
  background: #1c1c28;
}
.toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 20rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}
.toolbar-dark {
  background: #1c1c28;
}
.back {
  flex-shrink: 0;
}
.title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
  padding-right: 120rpx;
  box-sizing: border-box;
}
.title-light {
  color: #fff;
}
.wv {
  flex: 1;
  width: 100%;
  min-height: 0;
}
.wv-embed {
  min-height: 400rpx;
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
