<template>
  <view class="tab-bar">
    <view
      v-for="(item, index) in list"
      :key="item.pagePath"
      class="tab-item"
      :hover-stay-time="70"
      hover-class="tab-hover"
      @click="onSwitch(index, item.pagePath)"
    >
      <image
        class="ico"
        :src="selected === index ? item.selectedIconPath : item.iconPath"
        mode="aspectFit"
      />
      <text class="lab" :class="labelClass(index)">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const TAB_BAR_INDEX_EVENT = "app-tab-bar-index";

const list: {
  pagePath: string;
  text: string;
  iconPath: string;
  selectedIconPath: string;
}[] = [
  {
    pagePath: "/pages/index/index",
    text: "首页",
    iconPath: "/static/tab/home.png",
    selectedIconPath: "/static/tab/home-active.png",
  },
  {
    pagePath: "/pages/store/store",
    text: "门店管理",
    iconPath: "/static/tab/store.png",
    selectedIconPath: "/static/tab/store-active.png",
  },
  {
    pagePath: "/pages/wechat-push/wechat-push",
    text: "微信推送",
    iconPath: "/static/tab/wechat.png",
    selectedIconPath: "/static/tab/wechat-active.png",
  },
  {
    pagePath: "/pages/mine/mine",
    text: "个人中心",
    iconPath: "/static/tab/mine.png",
    selectedIconPath: "/static/tab/mine-active.png",
  },
];

const selected = ref(0);

function syncFromRoute() {
  try {
    const pages = getCurrentPages();
    const cur = pages[pages.length - 1];
    const route = cur ? String((cur as { route?: string }).route || "") : "";
    const url = route ? `/${route}` : "";
    const i = list.findIndex((x) => x.pagePath === url);
    if (i >= 0) selected.value = i;
  } catch {
    /* ignore */
  }
}

function onTabIndexEv(idx: unknown) {
  if (typeof idx === "number" && idx >= 0 && idx < list.length) selected.value = idx;
}

function onSwitch(index: number, path: string) {
  if (index === selected.value) return;
  uni.switchTab({
    url: path,
    fail: () => {
      uni.reLaunch({ url: path });
    },
  });
}

function labelClass(index: number) {
  if (selected.value !== index) return "lab-off";
  return index === 2 ? "lab-wechat-on" : "lab-gold-on";
}

onMounted(() => {
  syncFromRoute();
  uni.$on(TAB_BAR_INDEX_EVENT, onTabIndexEv);
});

onBeforeUnmount(() => {
  uni.$off(TAB_BAR_INDEX_EVENT, onTabIndexEv);
});
</script>

<style scoped>
.tab-bar {
  position: fixed;
  z-index: 9999;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-around;
  padding-top: 6px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
  background: #ffffff;
  border-top: 1rpx solid #e5e5e5;
  box-sizing: border-box;
  min-height: calc(56px + env(safe-area-inset-bottom, 0px));
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  min-height: 48px;
  padding: 4px 2px 6px;
  box-sizing: border-box;
}
.tab-hover {
  opacity: 0.88;
}
.ico {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.lab {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.lab-off {
  color: #909399;
}
.lab-gold-on {
  color: #e6b422;
}
.lab-wechat-on {
  color: #07c160;
}
</style>
