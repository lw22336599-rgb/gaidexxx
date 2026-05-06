<template>
  <view class="card">
    <view class="hd">
      <text class="hd-t">更新记录</text>
      <view class="hd-right">
        <text class="ver">V{{ version }}</text>
        <text class="view-all tappable" hover-class="view-all-hover" @tap="$emit('viewAll')">查看全部 ›</text>
      </view>
    </view>
    <scroll-view scroll-y class="scroll">
      <view
        v-for="(activity, index) in list"
        :key="index"
        class="item tappable"
        hover-class="item-hover"
        @tap="$emit('viewAll')"
      >
        <view class="item-row">
          <text class="time">{{ (activity as any).crtim }}</text>
          <text class="item-arrow">›</text>
        </view>
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

defineEmits<{
  (e: "viewAll"): void;
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
  (v) => { list.value = [...(v || [])]; },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.hd-t { font-size: 30rpx; font-weight: 600; color: #1c1c28; }
.hd-right { display: flex; align-items: center; gap: 16rpx; flex-shrink: 0; }
.ver { font-size: 22rpx; color: #909399; }
.view-all { font-size: 24rpx; color: #2d6cdf; }
.view-all-hover { opacity: 0.75; }
.scroll { max-height: 480rpx; }
.item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.item-hover { background: #f0f7ff; border-radius: 8rpx; padding-left: 8rpx; padding-right: 8rpx; margin: 0 -8rpx; }
.item-row { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
.time { font-size: 22rpx; color: #909399; display: block; }
.item-arrow { font-size: 28rpx; color: #c0c4cc; }
.name { font-size: 28rpx; font-weight: 600; color: #1c1c28; margin-top: 8rpx; display: block; }
.content {
  font-size: 26rpx;
  color: #444;
  line-height: 1.5;
  margin-top: 8rpx;
  white-space: pre-wrap;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.empty { text-align: center; color: #a8abb2; padding: 24rpx; font-size: 26rpx; }
.tappable { cursor: pointer; }
</style>
