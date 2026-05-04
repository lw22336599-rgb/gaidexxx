<template>
  <vab-card class="update-card">
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="folder-history-fill" />
          更新记录
        </div>
        <div class="header-spacer" aria-hidden="true" />
        <div class="header-version">您当前安装的版本为:V{{ version }}</div>
        <el-button class="collapse-btn" text type="primary" @click.stop="updatePanelExpanded = !updatePanelExpanded">
          <el-icon :size="16">
            <ArrowUp v-if="updatePanelExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </el-button>
      </div>
    </template>
    <div v-show="updatePanelExpanded" class="update-panel-body" style="max-height: 300px; overflow-y: scroll">
      <el-timeline style="padding: 10px 0 0 20px">
        <el-timeline-item v-for="(activity, index) in updateTopList" :key="index" :timestamp="activity.crtim">
          <template v-if="index === 0" #dot>
            <vab-dot
              style="width: var(--el-timeline-node-size-normal); height: var(--el-timeline-node-size-normal)"
              type="vab-dot vab-dot-success"
            />
          </template>
          <div>{{ activity.name }}</div>
          <div style="line-height: 1.4" v-html="activity.content" />
        </el-timeline-item>
      </el-timeline>
    </div>
  </vab-card>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { version } from '~/package.json'

const updatePanelExpanded = ref(true)
const props = defineProps({
  updateTop: Array
})
const updateTopList = ref([])
watch(
  props.updateTop,
  () => {
    updateTopList.value = props.updateTop
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.echarts-container {
  width: 100%;
  height: 150px;
  overflow-y: scroll;
  :deep() {
    .echarts {
      height: 200px !important;
    }
  }
}
.header-main {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  .header-left {
    flex-shrink: 0;
  }
  .header-spacer {
    flex: 1;
    min-width: 4px;
  }
  .header-version {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
  .collapse-btn {
    flex-shrink: 0;
    padding: 4px;
    min-height: auto;
    color: var(--el-text-color-secondary);
  }
}
</style>
