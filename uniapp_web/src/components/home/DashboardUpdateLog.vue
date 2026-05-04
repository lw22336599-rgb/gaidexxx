<template>
  <view class="card">
    <view class="hd">
      <text class="hd-t">更新记录</text>
      <text class="ver">当前版本 V{{ version }}</text>
    </view>
    <scroll-view scroll-y class="scroll">
      <view v-for="(activity, index) in list" :key="index" class="item">
        <text class="time">{{ (activity as any).crtim }}</text>
        <text class="name">{{ (activity as any).name }}</text>
        <text class="content">{{ formatContent((activity as any).content) }}</text>
      </view>
      <view v-if="!list.length" class="empty">暂无更新记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  updateTop: unknown[];
  version?: string;
}>();

const list = ref<unknown[]>([]);

function formatContent(html: unknown) {
  if (html === null || html === undefined) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

watch(
  () => props.updateTop,
  (v) => {
    list.value = [...(v || [])];
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.hd {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 12rpx;
}
.hd-t {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
}
.ver {
  font-size: 22rpx;
  color: #909399;
  flex-shrink: 0;
}
.scroll {
  max-height: 480rpx;
}
.item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.time {
  font-size: 22rpx;
  color: #909399;
  display: block;
}
.name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1c1c28;
  margin-top: 8rpx;
  display: block;
}
.content {
  font-size: 26rpx;
  color: #444;
  line-height: 1.5;
  margin-top: 8rpx;
  white-space: pre-wrap;
  display: block;
}
.empty {
  text-align: center;
  color: #a8abb2;
  padding: 24rpx;
}
</style>
