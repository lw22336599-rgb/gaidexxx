<template>
  <vab-card class="update-card">
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="folder-history-fill" />
          更新记录
        </div>
        <div>您当前安装的版本为:V{{ version }}</div>
      </div>
    </template>
    <div style="max-height: 300px;overflow-y: scroll">
      <el-timeline style="padding: 10px 0 0 20px">
        <el-timeline-item
          v-for="(activity, index) in updateTopList"
          :key="index"
          :timestamp="activity.crtim"
        >
          <template v-if="index === 0" #dot>
            <vab-dot style="width: var(--el-timeline-node-size-normal);height: var(--el-timeline-node-size-normal);" type="vab-dot vab-dot-success"/>
          </template>
          <div>{{activity.name }}</div>
          <div style="line-height: 1.4" v-html="activity.content">
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </vab-card>
</template>

<script setup lang="ts">
import {version } from '~/package.json'
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
      height: 200px!important;
    }
  }
}
.header-main{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
