<template>
  <div class="vab-notice-container">
    <el-tooltip content="账号及店铺信息模糊" placement="bottom" :teleported="true">
      <div class="vab-notice-wrapper">
        <el-switch v-model="noticeEnabled" :active-icon="BellFilled" active-value="enabled" class="vab-notice"
          :inactive-icon="Bell" inactive-value="disabled" inline-prompt />
        <span class="vab-notice-label">{{ noticeEnabled === 'enabled' ? '演示开' : '演示关' }}</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Bell, BellFilled } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'

defineOptions({
  name: 'VabNotice',
})

const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
const { updateDemoMode } = settingsStore

const noticeEnabled = computed({
  get: () => (demoMode.value ? 'enabled' : 'disabled'),
  set: (value: string) => {
    updateDemoMode(value === 'enabled')
  }
})

</script>

<style lang="scss" scoped>
.vab-notice-container {
  display: inline-block;
}

.vab-notice-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: var(--el-margin);
  margin-top: -6px;
}

.vab-notice-label {
  margin: -1px 0px 0px 0px;
  font-size: 12px;
  line-height: 1;
}
</style>