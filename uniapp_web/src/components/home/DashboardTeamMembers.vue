<template>
  <view class="team-card">
    <view class="hdr-row">
      <text class="hdr-title">团队成员</text>
      <text class="view-all tappable" hover-class="view-all-hover" @tap="$emit('viewAll')">查看全部 ›</text>
    </view>
    <view class="table-wrap">
      <view class="thead">
        <text class="th th-account">账号</text>
        <text class="th th-balance">剩余积分</text>
        <text class="th th-arrow"></text>
      </view>
      <view v-if="!rows.length" class="tbody empty">暂无数据</view>
      <view v-else class="tbody-list">
        <view
          v-for="(row, idx) in rows"
          :key="idx"
          class="trow tappable"
          hover-class="row-hover"
          :hover-stay-time="60"
          @tap="$emit('rowTap', row)"
        >
          <view class="td-avatar">
            <view class="avatar-box">
              <text class="avatar-ch">{{ firstChar(row) }}</text>
            </view>
          </view>
          <text class="td td-account">{{ accountName(row) }}</text>
          <text class="td td-balance">{{ balanceText(row) }}</text>
          <text class="td-arr">›</text>
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

defineEmits<{
  (e: "rowTap", row: unknown): void;
  (e: "viewAll"): void;
}>();

const rows = computed(() => (Array.isArray(props.teamTopList) ? props.teamTopList : []) as unknown[]);

function accountName(row: unknown): string {
  const r = row as Record<string, unknown>;
  return String(r.user_name ?? r.name ?? "—").trim() || "—";
}

function firstChar(row: unknown): string {
  const n = accountName(row);
  return n === "—" ? "子" : n.charAt(0).toUpperCase();
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
.hdr-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx 24rpx;
}
.hdr-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
}
.view-all {
  font-size: 24rpx;
  color: #2d6cdf;
  flex-shrink: 0;
}
.view-all-hover { opacity: 0.75; }
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
.th { font-size: 22rpx; color: #606266; font-weight: 500; }
.th-account { flex: 1; min-width: 0; padding-left: 52rpx; }
.th-balance { width: 160rpx; flex-shrink: 0; text-align: right; }
.th-arrow { width: 32rpx; flex-shrink: 0; }
.tbody.empty {
  text-align: center;
  padding: 48rpx 24rpx;
  font-size: 26rpx;
  color: #a8abb2;
  background: #fff;
}
.tbody-list { background: #fff; }
.trow {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 16rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fff;
}
.row-hover { background: #f0f7ff; }
.td-avatar {
  flex-shrink: 0;
  margin-right: 12rpx;
}
.avatar-box {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4da3ff 0%, #2d6cdf 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-ch { font-size: 22rpx; color: #fff; font-weight: 700; }
.td-account {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 12rpx;
}
.td-balance {
  width: 148rpx;
  flex-shrink: 0;
  text-align: right;
  font-size: 26rpx;
  color: #606266;
  font-variant-numeric: tabular-nums;
}
.td-arr {
  width: 32rpx;
  text-align: right;
  font-size: 32rpx;
  color: #c0c4cc;
  flex-shrink: 0;
}
.tappable { cursor: pointer; }
</style>
