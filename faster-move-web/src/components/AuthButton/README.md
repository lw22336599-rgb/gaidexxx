# AuthButton 全局授权组件

## 功能说明

全局授权组件按钮，封装了三种店铺授权方式：
1. **添加门店**：主按钮默认功能，通过浏览器自动获取授权
2. **手动授权**：下拉菜单选项，打开授权窗口手动完成授权（仅Electron环境可用）
3. **生成授权链接**：下拉菜单选项，生成授权链接并复制到剪贴板，可发送给商家

## 使用方式

### 基础用法

```vue
<template>
  <AuthButton :shop-type="currentShopType" />
</template>
```

### 带事件监听

```vue
<template>
  <AuthButton
    :shop-type="currentShopType"
    @refresh="handleRefresh"
    @success="handleSuccess"
  />
</template>

<script setup>
const handleRefresh = () => {
  // 刷新店铺列表
  getShopList()
}

const handleSuccess = () => {
  // 授权成功后的处理
}
</script>
```

### 自定义样式

```vue
<template>
  <AuthButton
    :shop-type="currentShopType"
    button-text="授权店铺"
    button-type="success"
    size="small"
  />
</template>
```

### 修复店铺场景

```vue
<template>
  <AuthButton
    :shop-type="shopType"
    :name="shopName"
    button-text="修复授权"
  />
</template>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| shopType | ShopType | - | 店铺类型（可选，不传则从localStorage读取） |
| buttonText | string | '添加门店' | 按钮文本 |
| buttonType | string | 'primary' | 按钮类型 |
| size | string | 'default' | 按钮大小 |
| disabled | boolean | false | 是否禁用 |
| name | string | '' | 店铺名称（用于修复店铺场景） |

## Events 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| success | 授权成功时触发 | - |
| refresh | 需要刷新列表时触发 | - |

## 店铺类型枚举

```typescript
export enum ShopType {
  None = 0,
  美团 = 1,
  饿了么 = 2,
  美团闪购 = 3,
  美团医药 = 4,
  饿百零售 = 5,
  京东到家 = 6,
  抖店即时零售 = 7,
  饿了么官方 = 8,
}
```

## 授权链接格式

生成的授权链接格式为：`{线路地址}/login/{店铺类型数字}/{用户ID}`

示例：`http://alien-admin.example.com/login/1/123`

## 注意事项

1. **手动授权**功能仅在 Electron 环境下可用
2. **生成授权链接**需要确保用户已登录且配置了线路地址
3. **饿了么官方**（ShopType=8）使用特殊的授权方式，直接从后端获取授权地址
4. 组件已全局注册，无需在使用时导入

## 已替换的页面

以下页面已使用此组件替换了原有的授权按钮：

- `src/views/shop/MtFeatureV2.vue`
- `src/views/shop/MtFeatureV2Functional.vue`
- `src/views/shop/MtFeatureV2Operation.vue`
- `src/views/shop/components/Screen.vue`
- `src/views/shop/components/ShopHeader.vue`
- `src/views/shop/componentsV2/ShopHeader.vue`
