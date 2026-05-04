<template>
  <div class="scroll-text-container">
    <tiny-scroll-text :direction="form.direction" :time="form.time">
      <div v-html="text" />
    </tiny-scroll-text>
  </div>
</template>

<script lang="ts" setup>
import { ScrollText as TinyScrollText } from '@opentiny/vue'
const props = defineProps({
  dataList: Array
})
const text = props.dataList[0]?.name
const form = reactive({
  theme: 'warning',
  direction: 'left',
  time: 25
})
</script>

<style lang="scss" scoped>
.scroll-text-container {
  :deep() {
    .tiny-scroll-text {
      position: relative;
      width: 100%;
      padding-left: 36px;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary);
      border-radius: var(--el-border-radius-base);

      &:before {
        position: absolute;
        left: 15px;
        font-family: 'remixicon', sans-serif !important;
        content: '';
      }

      &__wrapper {
        margin-bottom: var(--el-margin);

        .up {
          div {
            text-overflow: ellipsis;
            word-break: break-all;
            white-space: nowrap;
          }
        }
      }
    }

    .vab-scroll-text {
      &-primary {
        .tiny-scroll-text {
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
          border: 1px solid var(--el-color-primary);
        }
      }

      &-success {
        .tiny-scroll-text {
          color: var(--el-color-success);
          background-color: var(--el-color-success-light-9);
          border: 1px solid var(--el-color-success);
        }
      }

      &-warning {
        .tiny-scroll-text {
          color: var(--el-color-warning);
          background-color: var(--el-color-warning-light-9);
          border: 1px solid var(--el-color-warning);
        }
      }

      &-danger {
        .tiny-scroll-text {
          color: var(--el-color-danger);
          background-color: var(--el-color-danger-light-9);
          border: 1px solid var(--el-color-danger);
        }
      }

      &-info {
        .tiny-scroll-text {
          color: var(--el-color-info);
          background-color: var(--el-color-info-light-9);
          border: 1px solid var(--el-color-info);
        }
      }
    }
  }
}
</style>
