<template>
  <view class="card team-card">
    <text class="hdr-title">团队成员</text>
    <view class="table-wrap">
      <view class="thead">
        <text class="th th-left">账号</text>
        <text class="th th-right">剩余积分</text>
      </view>
      <view v-if="!fullSorted.length" class="tbody empty">暂无数据</view>
      <scroll-view
        v-else
        scroll-y
        class="tbody-scroll"
        :show-scrollbar="false"
        :lower-threshold="120"
        :scroll-with-animation="true"
        @scrolltolower="onLoadMore"
      >
        <view
          v-for="(it, i) in displayed"
          :key="i"
          class="trow"
          hover-class="row-hover"
          :hover-stay-time="60"
        >
          <text class="td td-left">{{ displayName(it) }}</text>
          <text class="td td-right">{{ (it as any).balance ?? "—" }}</text>
        </view>
        <view v-if="teamHasMore" class="load-foot">上拉加载更多</view>
        <view v-else-if="fullSorted.length > PAGE" class="load-foot done">已显示全部 {{ fullSorted.length }} 人</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const PAGE = 12;

const props = defineProps<{ teamTopList: unknown[] }>();

const visibleCount = ref(PAGE);

const fullSorted = computed(() => {
  const arr = [...(props.teamTopList || [])] as Record<string, unknown>[];
  return arr.sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));
});

const displayed = computed(() => fullSorted.value.slice(0, visibleCount.value));
const teamHasMore = computed(() => visibleCount.value < fullSorted.value.length);

watch(
  () => props.teamTopList,
  () => {
    visibleCount.value = PAGE;
  },
  { deep: true }
);

function onLoadMore() {
  if (!teamHasMore.value) return;
  visibleCount.value = Math.min(visibleCount.value + PAGE, fullSorted.value.length);
}

function displayName(it: Record<string, unknown>) {
  const s = it.shop_name ?? it.user_name ?? it.name;
  return String(s ?? "—");
}
</script>

<style scoped>
.team-card {
  margin-top: 28rpx;
  padding: 28rpx 0 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 28rpx rgba(28, 28, 40, 0.06);
  border: 1rpx solid rgba(28, 28, 40, 0.04);
  overflow: hidden;
}
.hdr-title {
  display: block;
  padding: 0 28rpx 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
}
.table-wrap {
  margin: 8rpx 20rpx 8rpx;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #ebeef5;
}
.thead {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #eceff4;
  padding: 22rpx 20rpx;
}
.th {
  font-size: 22rpx;
  color: #606266;
  font-weight: 500;
}
.th-left {
  flex: 1;
  min-width: 0;
}
.th-right {
  width: 160rpx;
  text-align: right;
}
.tbody {
  background: #fff;
}
.empty {
  text-align: center;
  padding: 48rpx 24rpx;
  font-size: 26rpx;
  color: #a8abb2;
}
.tbody-scroll {
  max-height: 560rpx;
  background: #fff;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.trow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 20rpx;
  border-top: 1rpx solid #f0f0f0;
  transition: background 0.15s ease;
}
.row-hover {
  background: #f9fafb;
}
.td-left {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #303133;
  padding-right: 16rpx;
}
.td-right {
  width: 160rpx;
  text-align: right;
  font-size: 26rpx;
  font-weight: 600;
  color: #303133;
}
.load-foot {
  text-align: center;
  padding: 20rpx 12rpx 28rpx;
  font-size: 22rpx;
  color: #909399;
}
.load-foot.done {
  color: #c0c4cc;
}
</style>
