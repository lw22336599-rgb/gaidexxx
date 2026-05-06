<template>
  <view class="team-card">
    <text class="hdr-title">团队成员</text>
    <view class="table-wrap">
      <view class="thead">
        <text class="th th-account">账号</text>
        <text class="th th-balance">剩余积分</text>
      </view>
      <view v-if="!rows.length" class="tbody empty">暂无数据</view>
      <view v-else class="tbody-list">
        <view v-for="(row, idx) in rows" :key="idx" class="trow" hover-class="row-hover" :hover-stay-time="60">
          <text class="td td-account">{{ accountName(row) }}</text>
          <text class="td td-balance">{{ balanceText(row) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  teamTopList: unknown[];
}>();

const rows = computed(() => (Array.isArray(props.teamTopList) ? props.teamTopList : []) as unknown[]);

function accountName(row: unknown): string {
  const r = row as Record<string, unknown>;
  return String(r.user_name ?? r.name ?? "—").trim() || "—";
}

function balanceText(row: unknown): string {
  const r = row as Record<string, unknown>;
  const v = r.balance ?? r.integral;
  if (v === undefined || v === null) return "—";
  return String(v);
}
</script>

<style scoped>
.team-card {
  margin-top: 24rpx;
  padding: 28rpx 0 24rpx;
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
  background: #eceff4;
  padding: 22rpx 16rpx;
  box-sizing: border-box;
}
.th {
  font-size: 22rpx;
  color: #606266;
  font-weight: 500;
}
.th-account {
  flex: 1;
  min-width: 0;
}
.th-balance {
  width: 160rpx;
  flex-shrink: 0;
  text-align: right;
}
.tbody.empty {
  text-align: center;
  padding: 48rpx 24rpx;
  font-size: 26rpx;
  color: #a8abb2;
  background: #fff;
}
.tbody-list {
  background: #fff;
}
.trow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 26rpx 16rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fff;
}
.row-hover {
  background: #f9fafb;
}
.td-account {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 12rpx;
}
.td-balance {
  width: 160rpx;
  flex-shrink: 0;
  text-align: right;
  font-size: 24rpx;
  color: #606266;
  font-variant-numeric: tabular-nums;
}
</style>
