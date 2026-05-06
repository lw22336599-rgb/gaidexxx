<template>
  <!-- #ifdef H5 -->
  <view :id="shellDomId" class="shell">
    <view class="toolbar">
      <text class="title">{{ title }}</text>
    </view>
    <web-view class="wv" :src="embedUrl" @load="onWvLoad" />
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN || APP-PLUS -->
  <view class="shell shell-native">
    <view class="toolbar">
      <text class="title">{{ title }}</text>
    </view>
    <web-view class="wv-native" :src="embedUrl" @load="onWvLoad" />
  </view>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <!-- #ifndef MP-WEIXIN -->
  <!-- #ifndef APP-PLUS -->
  <view class="shell pad">
    <text class="tip">当前平台暂不支持内嵌 PC 后台，请使用微信 / App 或浏览器 H5。</text>
  </view>
  <!-- #endif -->
  <!-- #endif -->
  <!-- #endif -->
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { buildPcAdminEmbedUrl, withPcAdminLoadBust } from "@/utils/pcAdminEmbed";

const props = defineProps<{
  title: string;
  /** PC 端 hash 路径，如 /shop-v2/functional */
  hashPath: string;
}>();

function isH5DomShell(): boolean {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return false;
  try {
    const info = uni.getSystemInfoSync() as UniNamespace.GetSystemInfoResult & { uniPlatform?: string };
    return (info.uniPlatform || "") === "web";
  } catch {
    return false;
  }
}

const reloadKey = ref(0);
const shellDomId = `pc-embed-${Math.random().toString(36).slice(2, 11)}`;

const embedUrl = computed(() =>
  withPcAdminLoadBust(buildPcAdminEmbedUrl(props.hashPath), reloadKey.value)
);

watch(
  () => props.hashPath,
  () => {
    reloadKey.value = 0;
  }
);

const LOAD_DEADLINE_MS = 28_000;
const MAX_LOAD_ATTEMPTS = 5;

const loaded = ref(false);
let watchdog: ReturnType<typeof setTimeout> | null = null;
let iframePoll: ReturnType<typeof setInterval> | null = null;
let iframeLoadCleanup: (() => void) | null = null;

function clearWatchdog() {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
}

function detachIframeLoadHook() {
  if (iframePoll) {
    clearInterval(iframePoll);
    iframePoll = null;
  }
  if (iframeLoadCleanup) {
    iframeLoadCleanup();
    iframeLoadCleanup = null;
  }
}

function armWatchdog() {
  if (!isH5DomShell()) return;
  clearWatchdog();
  loaded.value = false;
  watchdog = setTimeout(() => {
    watchdog = null;
    if (loaded.value) return;
    if (reloadKey.value >= MAX_LOAD_ATTEMPTS - 1) {
      return;
    }
    reloadKey.value += 1;
  }, LOAD_DEADLINE_MS);
}

function attachShellIframeLoadHook() {
  detachIframeLoadHook();
  if (!isH5DomShell()) return;

  const tryBind = (): boolean => {
    const iframe = document.querySelector(`#${shellDomId} iframe`) as HTMLIFrameElement | null;
    if (!iframe) return false;
    const handler = () => onWvLoad();
    iframe.addEventListener("load", handler);
    iframeLoadCleanup = () => iframe.removeEventListener("load", handler);
    return true;
  };

  if (tryBind()) return;
  let n = 0;
  iframePoll = setInterval(() => {
    n += 1;
    if (tryBind()) {
      if (iframePoll) clearInterval(iframePoll);
      iframePoll = null;
    } else if (n > 80) {
      if (iframePoll) clearInterval(iframePoll);
      iframePoll = null;
    }
  }, 100);
}

function onWvLoad() {
  loaded.value = true;
  clearWatchdog();
}

watch(
  embedUrl,
  () => {
    armWatchdog();
    void nextTick(() => attachShellIframeLoadHook());
  },
  { immediate: true }
);

onMounted(() => {
  void nextTick(() => attachShellIframeLoadHook());
});

onShow(() => {
  loaded.value = false;
  void nextTick(() => {
    attachShellIframeLoadHook();
    armWatchdog();
  });
});

onBeforeUnmount(() => {
  clearWatchdog();
  detachIframeLoadHook();
});
</script>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  background: #fffdf5;
}
.shell-native {
  /* 小程序 / App：web-view 占满标题栏下方区域，底部为自定义 tab 预留 */
  height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom, 0px));
}
.toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: #fffdf5;
  border-bottom: 1rpx solid rgba(230, 180, 34, 0.18);
}
.title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  letter-spacing: 1rpx;
  max-width: 92%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wv {
  flex: 1;
  width: 100%;
  min-height: 0;
}
.wv-native {
  flex: 1;
  width: 100%;
  min-height: 400rpx;
}
.pad {
  padding: 40rpx 32rpx;
  background: #f5f6fa;
}
.tip {
  font-size: 28rpx;
  color: #444;
  line-height: 1.6;
}
</style>
