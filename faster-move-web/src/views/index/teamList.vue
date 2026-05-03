<template>
  <vab-card class="team-card">
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="team-fill" />
          团队成员
        </div>
      </div>
    </template>
    <div class="echarts-container" :class="{ 'blur-chart': demoMode }">
      <vab-chart v-if="hasData" :option="option" />
    </div>
  </vab-card>
</template>

<script setup lang="ts">
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

const props = defineProps({
  teamTopList: Array
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
const teamList = ref([])
const hasData = ref(false)
let option = reactive({})
const updateChart = () => {
  teamList.value = props.teamTopList
  if (teamList.value && teamList.value.length > 0) {
    option = reactive<any>({
      tooltip: {
        trigger: 'axis',
        extraCssText: 'z-index:1',
      },
      grid: {
        top: '0%',
        left: '2%',
        right: '10%',
        bottom: '0%',
        containLabel: true,
      },
      xAxis: [
        {
          splitLine: {
            show: false,
          },
          type: 'value',
          show: false,
        },
      ],
      yAxis: [
        {
          splitLine: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          type: 'category',
          axisTick: {
            show: false,
          },
          data: teamList.value.sort((a, b) => a.balance - b.balance).map(item => item.name),
        },
      ],
      series: [
        {
          name: '剩余积分',
          type: 'bar',
          barWidth: 15,
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
            formatter: ({ data }: any) => {
              return `${data}`
            },
          },
          itemStyle: {
            borderRadius: 10,
            borderWidth: 2,
          },
          data: teamList.value.sort((a, b) => a.balance - b.balance).map(item => item.balance),
        },
      ],
    })
    hasData.value = true
  }
}

watch(
  props.teamTopList,
  () => {
    updateChart()
  },
  { immediate: true }
)

// 监听演示模式变化，更新图表
watch(
  demoMode,
  () => {
    updateChart()
  }
)
</script>
<style scoped lang="scss">
.echarts-container {
  width: 100%;
  height: 150px;
  overflow-y: scroll;
  :deep() {
    .echarts {
      height: 200px!important;
    }
  }

  // 模糊效果：模糊图表中的内容（账号名称和积分数值）
  &.blur-chart {
    :deep(.echarts) {
      filter: blur(4px);
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
  }
}
</style>
