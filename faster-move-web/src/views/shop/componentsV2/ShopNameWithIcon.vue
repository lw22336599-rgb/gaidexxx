<template>
  <div class="shop-name-with-icon">
    <!-- 平台图标：根据店铺平台类型或 typeStr 自动映射 -->
    <vab-icon v-if="platformIcon" class="shop-name-with-icon__logo" :icon="platformIcon" is-custom-svg />
    <!-- 店铺名称文本，支持长名称省略显示 -->
    <span class="shop-name-with-icon__text" :class="{ 'shop-name-with-icon__text--nowrap': noWrap }" :title="shopName">
      {{ shopName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

const props = defineProps<{
  /**
   * 店铺名称
   */
  shopName: string
  /**
   * 是否禁止换行（单行显示，超出使用省略号）
   * 默认允许自动换行
   */
  noWrap?: boolean
  /**
   * 店铺平台类型（后端 ShopType 枚举值）
   * 例如：ShopType.美团、ShopType.饿了么 等
   */
  shopType?: ShopType | number | null
  /**
   * 路由 meta 中的 typeStr，例如：'mt-feature'、'elm-feature'、'jd-home-feature' 等
   * 当同时传入 shopType 与 shopTypeStr 时，优先使用 shopTypeStr 进行图标映射
   */
  shopTypeStr?: string | null
}>()

/**
 * 根据 shopTypeStr 计算图标名称
 * 规则与门店列表等页面保持一致：去掉 -feature / -operate 后得到图标名称
 */
const iconFromTypeStr = computed<string | undefined>(() => {
  if (!props.shopTypeStr) {
    return undefined
  }
  const value = props.shopTypeStr.trim()
  if (!value) {
    return undefined
  }
  return value.replace(/-feature|-operate/gi, '')
})

/**
 * 根据 ShopType 枚举计算图标名称
 */
const iconFromShopType = computed<string | undefined>(() => {
  if (props.shopType === undefined || props.shopType === null) {
    return undefined
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
    default:
      return undefined
  }
})

/**
 * 最终使用的图标名称：
 * 1. 优先使用基于 shopTypeStr 计算出的图标
 * 2. 否则回退到基于 ShopType 枚举计算出的图标
 */
const platformIcon = computed<string | undefined>(() => {
  return iconFromTypeStr.value || iconFromShopType.value
})
</script>

<style scoped lang="scss">
.shop-name-with-icon {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  vertical-align: middle;

  &__logo {
    margin-right: 6px;
    font-size: 18px;
    flex-shrink: 0;
  }

  &__text {
    max-width: 100%;
    word-break: break-all;
    line-height: 1.4;
  }

  /* 禁止换行模式：单行省略号 */
  &__text--nowrap {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: normal;
  }
}
</style>