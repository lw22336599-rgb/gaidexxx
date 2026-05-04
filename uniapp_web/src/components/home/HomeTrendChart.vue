<template>
  <view class="card chart-card">
    <view class="hd">
      <view class="hd-left">
        <text class="hd-ico">📈</text>
        <text class="hd-t">近七日趋势</text>
      </view>
    </view>
    <view class="home-echart-inner">
    <!-- #ifdef H5 -->
    <view :id="domId" class="ech-host" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <scroll-view scroll-x class="tbl-wrap">
      <view class="tbl">
        <view class="tr th">
          <text class="td">日期</text>
          <text class="td">MT</text>
          <text class="td">ELM</text>
          <text class="td">成员</text>
          <text class="td">积分</text>
          <text class="td">京东</text>
        </view>
        <view v-for="(d, i) in xAxisData" :key="i" class="tr">
          <text class="td">{{ d }}</text>
          <text class="td">{{ centre[i] ?? "—" }}</text>
          <text class="td">{{ prov[i] ?? "—" }}</text>
          <text class="td">{{ addNum[i] ?? "—" }}</text>
          <text class="td">{{ integral[i] ?? "—" }}</text>
          <text class="td">{{ jdData[i] ?? "—" }}</text>
        </view>
      </view>
    </scroll-view>
    <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";

const props = defineProps<{
  xAxisData: string[];
  centre: number[];
  prov: number[];
  addNum: number[];
  integral: number[];
  jdData: number[];
}>();

const domId = `ech-home-${Math.random().toString(36).slice(2, 10)}`;
let chart: { setOption: (o: unknown, notMerge?: boolean) => void; resize: () => void; dispose: () => void } | null =
  null;
let echartsMod: typeof import("echarts") | null = null;

function lineSeries(
  echarts: typeof import("echarts"),
  name: string,
  data: number[],
  color: string,
  grad: [number, string][]
) {
  return {
    name,
    type: "line" as const,
    smooth: true,
    symbolSize: 4,
    showSymbol: false,
    itemStyle: { color },
    lineStyle: { color, width: 2 },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: grad[0][0], color: grad[0][1] },
        { offset: grad[1][0], color: grad[1][1] },
      ]),
    },
    data: [...data],
  };
}

function buildOption(echarts: typeof import("echarts")) {
  return {
    tooltip: {
      trigger: "axis" as const,
      confine: true,
      axisPointer: { type: "cross" as const },
    },
    legend: {
      type: "scroll" as const,
      show: true,
      orient: "horizontal" as const,
      bottom: 2,
      itemWidth: 10,
      itemHeight: 6,
      pageIconSize: 10,
      textStyle: { fontSize: 9, color: "#909399" },
    },
    grid: { top: 24, left: "2%", right: "2%", bottom: 40, containLabel: true },
    xAxis: [{ type: "category" as const, data: [...props.xAxisData], boundaryGap: false }],
    yAxis: [{ type: "value" as const }],
    series: [
      lineSeries(echarts, "MT店铺", props.centre, "#FF9402", [
        [0, "rgba(225, 212, 170, 1)"],
        [1, "rgba(225, 225, 225, 0.2)"],
      ]),
      lineSeries(echarts, "ELM店铺", props.prov, "#3c87ff", [
        [0, "rgba(144, 185, 254,1)"],
        [1, "rgba(225, 225, 225, 0.2)"],
      ]),
      lineSeries(echarts, "新增成员", props.addNum, "#08e090", [
        [0, "rgba(135, 255, 211,1)"],
        [1, "rgba(225, 225, 225, 0.2)"],
      ]),
      lineSeries(echarts, "积分消耗", props.integral, "#781EFF", [
        [0, "#781EFF"],
        [1, "rgba(225, 225, 225, 0.2)"],
      ]),
      lineSeries(echarts, "京东到家", props.jdData, "#F01414", [
        [0, "#F01414"],
        [1, "rgba(225, 225, 225, 0.2)"],
      ]),
    ],
  };
}

function resize() {
  chart?.resize();
}

async function initOrSet() {
  // #ifdef H5
  if (!echartsMod) {
    echartsMod = await import("echarts");
  }
  const el = document.getElementById(domId);
  if (!el || !echartsMod) return;
  if (!chart) {
    chart = echartsMod.init(el);
    window.addEventListener("resize", resize);
  }
  chart.setOption(buildOption(echartsMod), true);
  // #endif
}

onMounted(() => {
  // #ifdef H5
  void nextTick(() => void initOrSet());
  // #endif
});

watch(
  () => [props.xAxisData, props.centre, props.prov, props.addNum, props.integral, props.jdData],
  () => {
    // #ifdef H5
    void nextTick(() => void initOrSet());
    // #endif
  },
  { deep: true }
);

onBeforeUnmount(() => {
  // #ifdef H5
  window.removeEventListener("resize", resize);
  chart?.dispose();
  chart = null;
  echartsMod = null;
  // #endif
});
</script>

<style scoped>
.chart-card {
  padding: 28rpx 24rpx 24rpx;
}
.home-echart-inner {
  background: #f4f5f7;
  border-radius: 16rpx;
  padding: 12rpx 10rpx 8rpx;
  box-sizing: border-box;
}
.hd {
  margin-bottom: 16rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}
.hd-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.hd-ico {
  font-size: 32rpx;
  color: #409eff;
}
.hd-t {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
}
.ech-host {
  width: 100%;
  height: 360rpx;
}
.tbl-wrap {
  width: 100%;
}
.tbl {
  min-width: 720rpx;
}
.tr {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid #eee;
}
.tr.th {
  background: #f4f5f7;
  font-weight: 600;
}
.td {
  flex: 1;
  min-width: 100rpx;
  font-size: 22rpx;
  padding: 12rpx 8rpx;
  color: #333;
  word-break: break-all;
}
</style>
