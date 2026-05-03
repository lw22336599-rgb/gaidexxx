<template>

  <vab-icon class="vab-fullscreen" :icon="isFullscreen ? 'fullscreen-exit-fill' : 'fullscreen-fill'" @click="toggle" />

</template>

<script lang="ts" setup>
import Button from '@/views/vab/form/button.vue'

defineOptions({
  name: 'VabFullscreen',
})

const { isFullscreen, toggle } = useFullscreen()
</script>
