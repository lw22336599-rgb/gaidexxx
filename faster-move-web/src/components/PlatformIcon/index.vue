<template>
  <vab-icon v-if="iconName" :class="['platform-icon', customClass]" :icon="iconName" :style="iconStyle" is-custom-svg />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

interface Props {
  /**
   * 店铺平台类型（ShopType 枚举值）
   */
  shopType?: ShopType | number | null
  /**
   * 图标大小（像素）
   * 默认：16
   */
  size?: number | string
  /**
   * 自定义类名
   */
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  shopType: null,
  size: 16,
  customClass: ''
})

/**
 * 根据 ShopType 枚举计算图标名称
 */
const iconName = computed<string | null>(() => {
  if (props.shopType === undefined || props.shopType === null) {
    return null
  }

  const typeValue = Number(props.shopType) as ShopType

  switch (typeValue) {
    case ShopType.美团:
      return 'mt'
    case ShopType.饿了么:
    case ShopType.饿了么官方:
      return 'tbsg_wm'
    case ShopType.美团闪购:
      return 'mt-shop'
    case ShopType.美团医药:
      return 'mt-medicine'
    case ShopType.饿百零售:
      return 'tbsg_ls'
    case ShopType.京东到家:
      return 'jd-home'
    case ShopType.抖店即时零售:
      return 'dy-retail'
    case ShopType.美团团购:
      return 'mt'
    case ShopType.京东团购:
      return 'jd-home'
    case ShopType.抖音团购:
      return 'dy-retail'
    default:
      return null
  }
})

/**
 * 图标样式
 */
const iconStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    width: size,
    height: size,
    fontSize: size
  }
})
</script>

<style scoped lang="scss">
.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
