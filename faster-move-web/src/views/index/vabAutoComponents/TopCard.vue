<template>
  <vab-card class="top-card" :class="'top-card-' + countConfig.data_type">
    {{ title }}
    <template v-if="$slots.tag">
      <slot name="tag"></slot>
    </template>
    <div class="top-card-content">
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
      <div class="unit" :class="{ 'blur-text': demoMode }">{{ countConfig.unit }}</div>
    </div>
    <div v-if="countConfig.data_type === 200" class="right-icon">
      <vab-icon icon="group-fill"/>
    </div>
    <div v-if="countConfig.data_type === 100" class="right-icon">
      <vab-icon icon="database-2-fill" />
    </div>
    <div v-if="countConfig.data_type === 1" class="right-icon">
      <img alt="" src="/@/assets/home_images/icon_001.png">
    </div>
    <div v-if="countConfig.data_type === 2" class="right-icon">
      <img alt="" src="/@/assets/home_images/icon_002.png">
    </div>
    <div class="bottom">
      相较于昨日
      <vab-icon icon="arrow-up-line" />
      <span>{{ countConfig.of_yday }}</span>
      <template v-if="$slots.chart">
        <slot name="chart"></slot>
      </template>
    </div>
  </vab-card>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'TopCard',
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

defineProps({
  background: {
    type: String,
    default: 'white',
  },
  title: {
    type: String,
    default: 'Test',
  },
  icon: {
    type: String,
    default: '',
  },
  percentage: {
    type: String,
    default: '10%',
  },
  countConfig: {
    type: Object,
    default: () => {},
  },
})
</script>

<style lang="scss" scoped>
.top-card {
  position: relative;
  height: 168px !important;

  :deep() {
    .el-tag {
      float: right;
    }
  }

  .top-card-content {
    font-size: 28px;
    margin: 1em 0;
    .unit {
      display: inline-block;
      font-size: 12px;
      margin-left: 6px;
    }
  }

  .right-icon {
    position: absolute;
    top: 50%;
    right: 20px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    color: var(--el-color-primary);
    text-align: center;
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
    transform: translateY(-50%);

    i {
      font-size: 35px;
    }
    img {
      width: 60px;
      height: 60px;
    }
  }

  .bottom {
    .ri-arrow-up-line {
      width: 18px;
      height: 18px;
      margin: 0 3px 0 2px;
      color: var(--el-color-success);
      background: var(--el-color-success-light);
      border-radius: 50%;
      transform: scale(0.8);
    }

    span {
      color: var(--el-color-success);
    }
  }

  &-blue {
    color: var(--el-color-white);
    background: var(--el-color-primary);
    background: linear-gradient(90deg, var(--el-color-primary-light-4), var(--el-color-primary));

    .right-icon {
      color: var(--el-color-primary);
      background: var(--el-color-white);
    }

    .bottom {
      .ri-arrow-up-line {
        color: var(--el-color-primary);
        background: var(--el-color-white);
      }

      span {
        color: var(--el-color-white);
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
