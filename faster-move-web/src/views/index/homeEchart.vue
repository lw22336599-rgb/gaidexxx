<template>
  <vab-card class="home-echart" skeleton>
    <template #header>
      <div class="header-container">
        <div class="header-left">
          <vab-icon icon="line-chart-fill" />
          近七日趋势
        </div>
        <div class="header-right" @click="openTourState">
          <img alt="" src="/@/assets/home_images/icon_008.png">
          使用教程
        </div>
      </div>
    </template>
    <vab-chart :option="option" />
  </vab-card>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '/@/store/modules/settings'
import { lightenColor } from '/@/utils/lightenColor'
import * as echarts from 'echarts'
defineOptions({
  name: 'HomeEchart',
})
interface Props {
  centre: number[];
  prov: number[];
  addNum: number[];
  xAxisData: string[];
  integral: number[];
  jdData: number[];
}
const emit = defineEmits(['openTour']);
const openTourState = () => {
  emit('openTour', true);
}
const props = defineProps<Props>();
const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)
const option = reactive<any>({
  tooltip: {
    trigger: 'axis',
    extraCssText: 'z-index:1',
  },
  grid: {
    top: '6%',
    left: '2%',
    right: '4%',
    bottom: '0%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: props.xAxisData,
      boundaryGap: false,
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
  ],
  series: [
    {
      name: 'MT店铺',
      type: "line",
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#FF9402",
          lineStyle: {
            color: "#FF9402",
            width: 2,
          },
        },
      },
      label: {
        show: false,
        position: "top",
      },

      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(225, 212, 170, 1)",
              },
              {
                offset: 1,
                color: "rgba(225, 225, 225, 0.2)",
              },
            ],
            false
          ),
        },
      },
      data: props.centre
    },
    {
      name: 'ELM店铺',
      type: "line",
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#3c87ff",
          lineStyle: {
            color: "#3c87ff",
            width: 2,
          },
        },
      },
      label: {
        show: false,
        position: "top",
      },

      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(144, 185, 254,1)",
              },
              {
                offset: 1,
                color: "rgba(225, 225, 225, 0.2)",
              },
            ],
            false
          ),
        },
      },
      data: props.prov,
    },
    {
      name: '新增成员',
      type: "line",
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#08e090",
          lineStyle: {
            color: "#08e090",
            width: 2,
          },
        },
      },
      label: {
        show: false,
        position: "top",
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(135, 255, 211,1)",
              },
              {
                offset: 1,
                color: "rgba(225, 225, 225, 0.2)",
              },
            ],
            false
          ),
        },
      },
      data: props.addNum,
    },
    {
      name: '积分消耗',
      type: "line",
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#781EFF",
          lineStyle: {
            color: "#781EFF",
            width: 2,
          },
        },
      },
      label: {
        show: false,
        position: "top",
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "#781EFF",
              },
              {
                offset: 1,
                color: "rgba(225, 225, 225, 0.2)",
              },
            ],
            false
          ),
        },
      },
      data: props.integral,
    },
    {
      name: '京东到家',
      type: "line",
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: "#F01414",
          lineStyle: {
            color: "#F01414",
            width: 2,
          },
        },
      },
      label: {
        show: false,
        position: "top",
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "#F01414",
              },
              {
                offset: 1,
                color: "rgba(225, 225, 225, 0.2)",
              },
            ],
            false
          ),
        },
      },
      data: props.jdData,
    },
  ],
})
// watch(
//   theme.value,
//   () => {
//     option.color = [theme.value.color, lightenColor(theme.value.color, 50)]
//   },
//   { immediate: true }
// )
</script>
<style scoped lang="scss">
.home-echart {
  overflow: inherit;
}

.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {}

  .header-right {
    display: flex;
    align-items: center;
    cursor: pointer;

    img {
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
  }
}
</style>
