<template>
  <el-dropdown class="vab-font-size" @command="handleCommand">
    <div class="font-size-button">
      <vab-icon icon="font-size-2" />
      <span class="font-size-label">字体</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="item in fontSizeList" :key="item" :command="item">
          {{ item }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { useSettingsStore } from '/@/store/modules/settings'

defineOptions({
  name: 'VabFontSize',
})

const settingsStore = useSettingsStore()
const { theme } = storeToRefs(settingsStore)
const { updateTheme, saveTheme } = settingsStore
const fontSizeList = ref<string[]>(['13px', '13.5px', '14px', '15px', '15.5px', '16px'])

const handleCommand = (fontSize: string) => {
  theme.value.fontSize = fontSize
  updateTheme()
  saveTheme()
}
</script>

<style scoped lang="scss">
.vab-font-size {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.font-size-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  text-align: center;

}

.font-size-label {
  margin: 7px 4px -3px 0px;
  font-size: 12px;
  margin-right: -22px;
}
</style>