<template>
  <vab-colorful-card class="page-header" :style="style">
    <el-avatar class="page-header-avatar hidden-xs-only" :src="avatar" />
    <div class="page-header-tip">
      <div class="page-header-tip-title">
        {{ handleTips() }}
      </div>
      <div class="page-header-tip-description" v-html="description"></div>
    </div>
  </vab-colorful-card>
</template>

<script lang="ts" setup>
import { getList } from '/@/api/description'
import { useUserStore } from '/@/store/modules/user'

const userStore = useUserStore()
const { avatar } = storeToRefs(userStore)

const description = ref<string>('')

onBeforeMount(() => {
  fetchData()
})

const colorFrom = ref<string>('var(--el-color-primary-light-9)')
const colorTo = ref<string>('var(--el-color-white)')
const style = {
  background: `${colorTo.value} linear-gradient(120deg, ${colorFrom.value} 10%, ${colorTo.value}) no-repeat`,
}
</script>

<style lang="scss" scoped>
.page-header {
  :deep() {
    .el-card__body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
    }
  }

  &-avatar {
    width: 80px;
    height: 80px;
    padding: var(--el-padding);
    margin-right: var(--el-margin);
    border-radius: 50%;
  }

  &-tip {
    flex: auto;
    width: calc(100% - 200px);
    min-width: 300px;

    &-title {
      font-size: var(--el-font-size-large);
      font-weight: bold;
      line-height: 30px;
    }

    &-description {
      min-height: 25px;
      line-height: 25px;
    }
  }
}
</style>
