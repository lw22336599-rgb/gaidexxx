<template>
  <div v-if="'technology' != theme.themeName" class="vab-color-picker-wrapper" style="margin-left: var(--el-margin)">
    <div class="color-picker-button">
      <el-color-picker v-model="theme.color" popper-class="vab-color-picker-popper" :predefine="predefineColors"
        @active-change="handleChange" />
      <span class="color-picker-label">颜色</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { color as _color } from '/@/config/'
import { useSettingsStore } from '/@/store/modules/settings'

defineOptions({
  name: 'VabColorPicker',
})

const predefineColors = ref<any>([
  _color,
  '#1e90ff',
  '#4e6ef2',
  '#0052d9',
  '#3fb884',
  '#16baa9',
  '#07c160',
  '#009688',
  '#6954f0',
  '#7b40f2',
  '#f01414',
])
const settingsStore = useSettingsStore()
const { updateTheme, saveTheme } = settingsStore
const { theme } = storeToRefs(settingsStore)

const handleChange = (value: any) => {
  theme.value.color = value
  updateTheme()
  saveTheme()
}

onBeforeMount(() => {
  // 还原默认
  $sub('shop-vite-reset-color', () => {
    handleChange(_color)
  })
})
</script>

<style lang="scss">
.vab-color-picker-popper {
  box-sizing: content-box !important;
  padding: calc(var(--el-padding) / 2);

  .el-color-dropdown__link-btn {
    display: none;
  }

  .el-color-dropdown__btns {
    margin-top: 0;
  }
}

.vab-color-picker-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.color-picker-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  text-align: center;
}

.color-picker-label {
  margin: -7px -2px 0px 0px;
  font-size: 12px;
}
</style>