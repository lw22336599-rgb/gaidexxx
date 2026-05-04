<template>
  <vab-card class="team-card">
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="team-fill" />
          团队成员
        </div>
        <div class="header-spacer" aria-hidden="true" />
        <el-button class="collapse-btn" text type="primary" @click.stop="teamPanelExpanded = !teamPanelExpanded">
          <el-icon :size="16">
            <ArrowUp v-if="teamPanelExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </div>
    </template>
    <div v-show="teamPanelExpanded" class="team-panel-body">
      <div class="echarts-container" :class="{ 'blur-chart': demoMode }">
        <vab-chart v-if="hasData" :option="option" />
      </div>
    </div>
  </vab-card>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

const teamPanelExpanded = ref(true)
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
        extraCssText: 'z-index:1'
      },
      grid: {
        top: '0%',
        left: '2%',
        right: '10%',
        bottom: '0%',
        containLabel: true
      },
      xAxis: [
        {
          splitLine: {
            show: false
          },
          type: 'value',
          show: false
        }
      ],
      yAxis: [
        {
          splitLine: {
            show: false
          },
          axisLine: {
            show: false
          },
          type: 'category',
          axisTick: {
            show: false
          },
          data: teamList.value.sort((a, b) => a.balance - b.balance).map(item => item.name)
        }
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
            }
          },
          itemStyle: {
            borderRadius: 10,
            borderWidth: 2
          },
          data: teamList.value.sort((a, b) => a.balance - b.balance).map(item => item.balance)
        }
      ]
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
watch(demoMode, () => {
  updateChart()
})
</script>
<style scoped lang="scss">
.team-card {
  :deep(.vab-card__header) {
    padding: 12px 18px 10px;
  }

  :deep(.el-card__body) {
    padding-top: 0;
  }
}

.header-main {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  .header-left {
    flex-shrink: 0;
  }
  .header-spacer {
    flex: 1;
    min-width: 4px;
  }
}
.collapse-btn {
  padding: 4px;
  min-height: auto;
  color: var(--el-text-color-secondary);
}
.team-panel-body {
  width: 100%;
  padding: 12px 0 8px;
}
.echarts-container {
  width: 100%;
  height: 150px;
  overflow-y: scroll;
  margin-top: 4px;
  :deep() {
    .echarts {
      height: 200px !important;
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
