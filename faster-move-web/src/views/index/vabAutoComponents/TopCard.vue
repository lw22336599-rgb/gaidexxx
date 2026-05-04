<template>
  <vab-card class="top-card" :class="'top-card-' + countConfig.data_type">
    <template v-if="$slots.tag">
      <slot name="tag" />
    </template>
    <div class="top-card-header-row">
      <div class="top-card-title-text">{{ title }}</div>
      <div v-if="totalRightLabel" class="top-card-total-label" :class="{ 'blur-text': demoMode }">
        {{ totalRightLabel }}
      </div>
    </div>
    <div class="top-card-content">
      <div class="top-card-count-line">
        <span :class="{ 'blur-text': demoMode }">
          <vab-count
            :decimals="countConfig.decimals"
            :duration="countConfig.duration"
            :end-value="countConfig.count"
            :prefix="countConfig.prefix"
            :separator="countConfig.separator"
            :start-value="countConfig.startValue"
            :suffix="countConfig.suffix"
          />
        </span>
        <span class="unit" :class="{ 'blur-text': demoMode }">{{ countConfig.unit }}</span>
      </div>
    </div>
    <div v-if="countConfig.data_type === 200" class="right-icon">
      <vab-icon icon="group-fill" />
    </div>
    <div v-if="countConfig.data_type === 100" class="right-icon">
      <vab-icon icon="database-2-fill" />
    </div>
    <div v-if="countConfig.data_type === 1" class="right-icon">
      <img alt="" src="/@/assets/home_images/icon_001.png" />
    </div>
    <div v-if="countConfig.data_type === 2" class="right-icon">
      <img alt="" src="/@/assets/home_images/icon_002.png" />
    </div>
    <div class="bottom">
      <span class="bottom-label">相较于昨日</span>
      <vab-icon icon="arrow-up-line" />
      <span class="bottom-delta">{{ countConfig.of_yday }}</span>
      <template v-if="$slots.chart">
        <slot name="chart" />
      </template>
    </div>
  </vab-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'TopCard'
})

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const props = defineProps({
  background: {
    type: String,
    default: 'white'
  },
  title: {
    type: String,
    default: 'Test'
  },
  icon: {
    type: String,
    default: ''
  },
  percentage: {
    type: String,
    default: '10%'
  },
  countConfig: {
    type: Object,
    default: () => ({})
  }
})

/** 与手机端 KPI 一致：右上「全部 N + 单位」 */
const totalRightLabel = computed(() => {
  const c = props.countConfig as Record<string, unknown>
  if (!c || c.all_total === undefined || c.all_total === null) return ''
  const u = c.unit != null && String(c.unit).trim() !== '' ? String(c.unit) : ''
  return `全部${c.all_total}${u}`
})
</script>

<style lang="scss" scoped>
.top-card {
  position: relative;
  height: 168px !important;
  /* 与手机端 metric-cell 统一视觉：圆角 / 间距 / 阴影 / 边框 */
  border-radius: 12px;
  box-shadow: 0 3px 14px rgba(28, 28, 40, 0.06) !important;
  border: 1px solid rgba(28, 28, 40, 0.04) !important;
  padding: 16px 18px !important;

  :deep() {
    .el-tag {
      float: right;
    }
    .el-card__body {
      padding: 0 !important;
    }
  }

  .top-card-header-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-right: 72px;
    box-sizing: border-box;
  }

  .top-card-title-text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--el-text-color-regular);
  }

  .top-card-total-label {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    margin-top: 1px;
  }

  .top-card-content {
    margin: 14px 0 10px;
    padding-right: 72px;
    box-sizing: border-box;
  }

  .top-card-count-line {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px 8px;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.15;

    :deep(.vab-count),
    :deep(.vab-count *) {
      font-weight: 700;
    }

    .unit {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      line-height: 1.2;
    }
  }

  .right-icon {
    position: absolute;
    top: 56%;
    right: 16px;
    width: 56px;
    height: 56px;
    line-height: 56px;
    color: var(--el-color-primary);
    text-align: center;
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
    transform: translateY(-50%);

    i {
      font-size: 32px;
    }
    img {
      width: 56px;
      height: 56px;
    }
  }

  .bottom {
    font-size: 11px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);

    .bottom-label {
      color: #a8abb2;
      margin-right: 2px;
    }

    .bottom-delta {
      color: var(--el-color-success);
      font-weight: 500;
    }

    .ri-arrow-up-line {
      width: 16px;
      height: 16px;
      margin: 0 2px 0 2px;
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
      border-radius: 50%;
      transform: scale(0.75);
    }
  }

  &-blue {
    color: var(--el-color-white);
    background: var(--el-color-primary);
    background: linear-gradient(90deg, var(--el-color-primary-light-4), var(--el-color-primary));

    .top-card-title-text,
    .top-card-total-label {
      color: rgba(255, 255, 255, 0.92);
    }

    .top-card-count-line .unit {
      color: rgba(255, 255, 255, 0.88);
    }

    .right-icon {
      color: var(--el-color-primary);
      background: var(--el-color-white);
    }

    .bottom {
      color: rgba(255, 255, 255, 0.72);

      .bottom-label {
        color: rgba(255, 255, 255, 0.55);
      }

      .bottom-delta {
        color: var(--el-color-white);
      }

      .ri-arrow-up-line {
        color: var(--el-color-primary);
        background: var(--el-color-white);
      }
    }
  }
}

:deep(.blur-text) {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
</style>
