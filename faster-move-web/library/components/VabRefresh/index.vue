<template>
  <div class="refresh-button" @click="refreshRoute">
    <vab-icon :class="className" icon="refresh-line" />
    <span class="refresh-label">刷新</span>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'VabRefresh',
})

const className = ref<string>('')

const rotate = () => {
  className.value = 'rotate'
  setTimeout(() => {
    className.value = ''
  }, 500)
}

const refreshRoute = () => {
  $pub('reload-router-view')
  rotate()
}

onBeforeMount(() => {
  $sub('refresh-rotate', () => {
    rotate()
  })
})
</script>

<style scoped lang="scss">
.refresh-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  text-align: center;
}

.refresh-label {
  margin: 7px -24px -2px 0px;
  font-size: 12px;
}
</style>