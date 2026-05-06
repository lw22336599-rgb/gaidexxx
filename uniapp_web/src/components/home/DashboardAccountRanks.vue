<template>
  <view class="card account-card">
    <text class="hdr-title">月度成员数据排行</text>

    <view class="tabs">
      <view
        class="pill"
        hover-class="pill-hover"
        :hover-stay-time="70"
        :class="{ active: currentTab === 1 }"
        @tap="switchTab(1, 'payTop')"
      >
        <text class="pill-t">消耗积分数</text>
      </view>
      <view
        class="pill"
        hover-class="pill-hover"
        :hover-stay-time="70"
        :class="{ active: currentTab === 2 }"
        @tap="switchTab(2, 'memberTop')"
      >
        <text class="pill-t">名下成员数</text>
      </view>
      <view
        class="pill"
        hover-class="pill-hover"
        :hover-stay-time="70"
        :class="{ active: currentTab === 3 }"
        @tap="switchTab(3, 'shopTop')"
      >
        <text class="pill-t">名下店铺数</text>
      </view>
    </view>

    <view class="table-wrap">
      <view class="thead">
        <text class="th th-rank">排名</text>
        <text class="th th-account">账号</text>
        <text class="th th-a">{{ colA }}</text>
        <text class="th th-b">{{ colB }}</text>
      </view>

      <view v-if="!fullRows.length" class="tbody empty">暂无数据</view>
      <view v-else class="tbody-list">
        <view
          v-for="(row, idx) in fullRows"
          :key="idx"
          class="trow"
          hover-class="row-hover"
          :hover-stay-time="60"
        >
          <view class="td td-rank">
            <text v-if="idx === 0" class="badge g1">1</text>
            <text v-else-if="idx === 1" class="badge g2">2</text>
            <text v-else-if="idx === 2" class="badge g3">3</text>
            <text v-else class="badge gx">{{ idx + 1 }}</text>
          </view>
          <view class="td td-account">
            <view class="img-box">
              <text class="z">子</text>
            </view>
            <text class="acc-name">{{ (row as any).user_name || "—" }}</text>
          </view>
          <text class="td td-num">{{ cellA(row) }}</text>
          <text class="td td-num">{{ cellB(row) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  monthMemberData: { payTop: unknown[]; memberTop: unknown[]; shopTop: unknown[] };
}>();

const currentTab = ref(2);
const typeKey = ref<"payTop" | "memberTop" | "shopTop">("memberTop");
const fullRows = ref<unknown[]>([]);

const colA = computed(() => {
  if (typeKey.value === "payTop") return "上月消耗";
  if (typeKey.value === "memberTop") return "今日新增";
  return "美团外卖";
});

const colB = computed(() => {
  if (typeKey.value === "payTop") return "累计消耗";
  if (typeKey.value === "memberTop") return "累计成员";
  return "饿了么";
});

function cellA(row: unknown) {
  const r = row as Record<string, unknown>;
  if (typeKey.value === "payTop") return String(r.last_month_count ?? "—");
  if (typeKey.value === "memberTop") return String(r.today_add ?? r.last_month_count ?? "—");
  return String(r.mt_count ?? "—");
}

function cellB(row: unknown) {
  const r = row as Record<string, unknown>;
  if (typeKey.value === "payTop") return String(r.total ?? "—");
  if (typeKey.value === "memberTop") return String(r.total ?? "—");
  return String(r.elm_count ?? "—");
}

function applyRowsFromProps() {
  const key = typeKey.value;
  const src = ((props.monthMemberData as Record<string, unknown[]>)[key] || []) as unknown[];
  fullRows.value = [...src];
}

function switchTab(num: number, key: "payTop" | "memberTop" | "shopTop") {
  currentTab.value = num;
  typeKey.value = key;
  applyRowsFromProps();
}

watch(
  () => props.monthMemberData,
  () => applyRowsFromProps(),
  { deep: true, immediate: true }
);
</script>

<style scoped>
.account-card {
  margin-top: 24rpx;
  padding: 28rpx 0 20rpx;
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
.tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 12rpx;
  padding: 12rpx 20rpx 24rpx;
  box-sizing: border-box;
}
.pill {
  flex: 1;
  min-width: 0;
  padding: 16rpx 8rpx;
  border-radius: 12rpx;
  background: #eceff4;
  text-align: center;
  box-sizing: border-box;
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.pill-hover {
  opacity: 0.92;
  transform: scale(0.98);
}
.pill.active {
  background: #2ecc71;
}
.pill-t {
  font-size: 22rpx;
  color: #303133;
  font-weight: 500;
}
.pill.active .pill-t {
  color: #ffffff;
  font-weight: 600;
}
.table-wrap {
  margin: 8rpx 20rpx 24rpx;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #ebeef5;
}
.thead {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #eceff4;
  padding: 22rpx 12rpx;
  box-sizing: border-box;
}
.th {
  font-size: 22rpx;
  color: #606266;
  font-weight: 500;
}
.th-rank {
  width: 72rpx;
  flex-shrink: 0;
  text-align: center;
}
.th-account {
  flex: 1.4;
  min-width: 0;
  padding-left: 8rpx;
}
.th-a,
.th-b {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.tbody.empty {
  min-height: 120rpx;
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
  padding: 26rpx 12rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fff;
  transition: background 0.15s ease;
}
.row-hover {
  background: #f9fafb;
}
.td-rank {
  width: 72rpx;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.td-account {
  flex: 1.4;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
}
.img-box {
  width: 48rpx;
  height: 48rpx;
  background: #d8d8d8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.z {
  font-size: 20rpx;
  color: #666;
}
.acc-name {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.td-num {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 24rpx;
  color: #606266;
}
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}
.badge.g1 {
  background: #e6a23c;
  color: #fff;
}
.badge.g2 {
  background: #909399;
  color: #fff;
}
.badge.g3 {
  background: #b88230;
  color: #fff;
}
.badge.gx {
  background: transparent;
  color: #909399;
  font-weight: 600;
}
</style>
