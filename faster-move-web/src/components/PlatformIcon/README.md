# PlatformIcon 平台图标组件

一个用于显示各个平台图标的通用组件，支持美团、饿了么、京东到家等多个平台。

## 功能特点

- 🎯 自动根据平台类型显示对应图标
- 📐 支持自定义图标大小
- 🎨 支持自定义类名
- 💪 完整的 TypeScript 类型支持

## 基本用法

```vue
<template>
  <PlatformIcon :shop-type="shopType" />
</template>

<script setup lang="ts">
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'

const shopType = ShopType.美团
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
| --- | --- | --- | --- | --- |
| shopType | 平台类型（ShopType 枚举值） | `ShopType \| number \| null` | `null` | 否 |
| size | 图标大小（像素） | `number \| string` | `16` | 否 |
| customClass | 自定义类名 | `string` | `''` | 否 |

## 支持的平台

| 平台名称 | ShopType 枚举 | 图标名称 |
| --- | --- | --- |
| 美团外卖 | `ShopType.美团` (1) | `mt` |
| 饿了么 | `ShopType.饿了么` (2) | `tbsg_wm` |
| 美团闪购 | `ShopType.美团闪购` (3) | `mt-shop` |
| 美团医药 | `ShopType.美团医药` (4) | `mt-medicine` |
| 饿百零售 | `ShopType.饿百零售` (5) | `tbsg_ls` |
| 京东到家 | `ShopType.京东到家` (6) | `jd-home` |
| 抖店即时零售 | `ShopType.抖店即时零售` (7) | `dy-retail` |
| 饿了么官方 | `ShopType.饿了么官方` (8) | `tbsg_wm` |

## 使用示例

### 默认大小

```vue
<PlatformIcon :shop-type="ShopType.美团" />
```

### 自定义大小

```vue
<!-- 使用数字 -->
<PlatformIcon :shop-type="ShopType.饿了么" :size="24" />

<!-- 使用字符串 -->
<PlatformIcon :shop-type="ShopType.京东到家" size="32px" />
```

### 自定义类名

```vue
<PlatformIcon
  :shop-type="ShopType.美团闪购"
  :size="20"
  custom-class="my-custom-icon"
/>
```

### 在标签中使用

```vue
<el-tag>
  <PlatformIcon :shop-type="shopType" :size="14" />
  店铺名称
</el-tag>
```

### 与店铺名称组合

```vue
<div class="shop-info">
  <PlatformIcon :shop-type="row.shop_type" :size="20" />
  <span class="shop-name">{{ row.name }}</span>
</div>
```

## 实际应用场景

1. **客服聊天列表** - 显示会话所属平台
2. **店铺管理页面** - 显示店铺所属平台
3. **订单列表** - 显示订单来源平台
4. **数据统计** - 显示各平台数据图标
5. **消息通知** - 显示消息来源平台

## 注意事项

1. 如果传入的 `shopType` 为 `null` 或 `undefined`，组件将不显示任何内容
2. 如果传入的 `shopType` 不在支持列表中，组件也不会显示
3. 图标使用 `vab-icon` 组件，需要确保项目中已配置相应的 SVG 图标资源
