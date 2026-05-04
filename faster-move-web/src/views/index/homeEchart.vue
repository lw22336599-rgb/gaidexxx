<template>
  <vab-card class="home-echart" skeleton>
    <template #header>
      <div class="header-container">
        <div class="header-left">
          <vab-icon icon="line-chart-fill" />
          近七日趋势
        </div>
        <div class="header-right" @click="openTourState">
          <img alt="" src="/@/assets/home_images/icon_008.png" />
          使用教程
        </div>
      </div>
    </template>
    <div class="home-echart-inner">
      <vab-chart :option="option" />
    </div>
  </vab-card>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
defineOptions({
  name: 'HomeEchart'
})
interface Props {
  centre: number[]
  prov: number[]
  addNum: number[]
  xAxisData: string[]
  integral: number[]
  jdData: number[]
}
const emit = defineEmits(['openTour'])
const openTourState = () => {
  emit('openTour', true)
}
const props = defineProps<Props>()
const option = reactive<any>({
  tooltip: {
    trigger: 'axis',
    confine: true,
    extraCssText: 'z-index:20;max-width:min(360px,92vw);',
    axisPointer: {
      type: 'cross',
      crossStyle: { color: '#909399', width: 1, type: 'dashed' },
      lineStyle: { color: '#909399', width: 1, type: 'dashed' },
      label: {
        show: true,
        backgroundColor: '#6a7985',
        color: '#fff',
        fontSize: 11
      }
    },
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: '#e4e7ed',
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: '#303133', fontSize: 12 },
    formatter(params: unknown) {
      const list = Array.isArray(params) ? params : [params]
      if (!list.length) return ''
      const first = list[0] as { axisValueLabel?: string; axisValue?: string; name?: string }
      const axis = first.axisValueLabel || first.axisValue || first.name || ''
      const rows = list
        .map((p: any) => {
          const v = p.value
          const n = v === null || v === undefined || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString()
          const c = p.color || '#409eff'
          return `<div style="display:flex;align-items:center;gap:8px;line-height:22px;margin:3px 0">
            <span style="flex-shrink:0;width:8px;height:8px;border-radius:50%;background:${c}"></span>
            <span style="flex:1;min-width:0">${p.seriesName}</span>
            <span style="font-weight:600;flex-shrink:0">${n}</span>
          </div>`
        })
        .join('')
      return `<div style="font-weight:600;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #ebeef5">${axis}</div>${rows}`
    }
  },
  legend: {
    show: true,
    orient: 'vertical',
    top: 8,
    right: 6,
    left: 'auto',
    itemWidth: 10,
    itemHeight: 8,
    itemGap: 6,
    textStyle: {
      fontSize: 11,
      color: '#909399'
    }
  },
  grid: {
    top: 12,
    left: '2%',
    right: 108,
    bottom: '4%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: props.xAxisData,
      boundaryGap: false
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'MT店铺',
      type: 'line',
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: '#FF9402',
          lineStyle: {
            color: '#FF9402',
            width: 2
          }
        }
      },
      label: {
        show: false,
        position: 'top'
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
                color: 'rgba(225, 212, 170, 1)'
              },
              {
                offset: 1,
                color: 'rgba(225, 225, 225, 0.2)'
              }
            ],
            false
          )
        }
      },
      data: props.centre
    },
    {
      name: 'ELM店铺',
      type: 'line',
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: '#3c87ff',
          lineStyle: {
            color: '#3c87ff',
            width: 2
          }
        }
      },
      label: {
        show: false,
        position: 'top'
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
                color: 'rgba(144, 185, 254,1)'
              },
              {
                offset: 1,
                color: 'rgba(225, 225, 225, 0.2)'
              }
            ],
            false
          )
        }
      },
      data: props.prov
    },
    {
      name: '新增成员',
      type: 'line',
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: '#08e090',
          lineStyle: {
            color: '#08e090',
            width: 2
          }
        }
      },
      label: {
        show: false,
        position: 'top'
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
                color: 'rgba(135, 255, 211,1)'
              },
              {
                offset: 1,
                color: 'rgba(225, 225, 225, 0.2)'
              }
            ],
            false
          )
        }
      },
      data: props.addNum
    },
    {
      name: '积分消耗',
      type: 'line',
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: '#781EFF',
          lineStyle: {
            color: '#781EFF',
            width: 2
          }
        }
      },
      label: {
        show: false,
        position: 'top'
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
                color: '#781EFF'
              },
              {
                offset: 1,
                color: 'rgba(225, 225, 225, 0.2)'
              }
            ],
            false
          )
        }
      },
      data: props.integral
    },
    {
      name: '京东到家',
      type: 'line',
      smooth: true,
      // stack: '总量',
      symbolSize: 5,
      showSymbol: false,
      itemStyle: {
        normal: {
          color: '#F01414',
          lineStyle: {
            color: '#F01414',
            width: 2
          }
        }
      },
      label: {
        show: false,
        position: 'top'
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
                color: '#F01414'
              },
              {
                offset: 1,
                color: 'rgba(225, 225, 225, 0.2)'
              }
            ],
            false
          )
        }
      },
      data: props.jdData
    }
  ]
})

function syncHomeChartFromProps() {
  const x = [...props.xAxisData]
  option.xAxis[0].data = x
  option.series[0].data = [...props.centre]
  option.series[1].data = [...props.prov]
  option.series[2].data = [...props.addNum]
  option.series[3].data = [...props.integral]
  option.series[4].data = [...props.jdData]
}

watch(
  () => [props.xAxisData, props.centre, props.prov, props.addNum, props.integral, props.jdData],
  () => {
    syncHomeChartFromProps()
  },
  { deep: true, immediate: true }
)
</script>
<style scoped lang="scss">
.home-echart {
  overflow: inherit;
}

.home-echart-inner {
  background: #f4f5f7;
  border-radius: 8px;
  padding: 8px 10px 4px;
  box-sizing: border-box;

  :deep(.echarts) {
    min-height: 200px;
  }
}

.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
  }

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
