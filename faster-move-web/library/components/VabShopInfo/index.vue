<template>
  <div class="vab-shop-info">
    <img v-if="shopType" :src="getShopIcon(shopType)" class="shop-icon" :alt="getShopTypeName(shopType)"
      :style="{ width: iconSize + 'px', height: iconSize + 'px' }" />
    <span class="shop-name">{{ shopName }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

/**
 * 店铺信息组件
 * 显示店铺平台图标和名称
 */
defineOptions({
  name: 'VabShopInfo',
})

interface Props {
  /** 店铺类型 */
  shopType?: ShopType | number
  /** 店铺名称 */
  shopName: string
  /** 图标大小 */
  iconSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 16,
})

/**
 * 获取店铺平台图标路径
 */
const getShopIcon = (type: ShopType | number) => {
  const iconMap: Record<number, string> = {
    1: new URL('../../../src/icon/mt.svg', import.meta.url).href, // 美团
    2: new URL('../../../src/icon/elm.svg', import.meta.url).href, // 饿了么
    3: new URL('../../../src/icon/mt-shop.svg', import.meta.url).href, // 美团闪购
    4: new URL('../../../src/icon/mt-medicine.svg', import.meta.url).href, // 美团医药
    5: new URL('../../../src/icon/elm-retail.svg', import.meta.url).href, // 饿百零售
    6: new URL('../../../src/icon/jd-home.svg', import.meta.url).href, // 京东到家
    7: new URL('../../../src/icon/dy-retail.svg', import.meta.url).href, // 抖店即时零售
    8: new URL('../../../src/icon/elm.svg', import.meta.url).href, // 饿了么官方
  }
  return iconMap[type as number] || ''
}

/**
 * 获取店铺类型名称
 */
const getShopTypeName = (type: ShopType | number) => {
  const typeMap: Record<number, string> = {
    1: '美团',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售',
    8: '饿了么官方',
  }
  return typeMap[type as number] || ''
}
</script>

<style lang="scss" scoped>
.vab-shop-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  .shop-icon {
    flex-shrink: 0;
    object-fit: contain;
    vertical-align: middle;
  }

  .shop-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
  }
}
</style>