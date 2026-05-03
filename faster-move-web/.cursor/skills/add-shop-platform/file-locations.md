# 文件修改位置参考

## 1. 图标配置

### src/components/PlatformIcon/index.vue

在 `iconName` computed 的 switch 语句中添加：

```typescript
case ShopType.新平台:
  return 'icon-name'
```

## 2. Electron 端

### src-electron/main.js

**urlMap** (搜索 `const urlMap`，在 `open-auth-window` handler 附近):
```javascript
1000: 'https://xxx.com',
```

**domainMap** (搜索 `const domainMap`，在 `get-auth-cookies` handler 中):
```javascript
1000: ['.xxx.com', 'xxx.com'],
```

**新 IPC handler** (在现有 handler 如 `open-mt-wm` 附近添加):
```javascript
ipcMain.handle('open-xxx-platform', async (event, row) => {
  // 参考 open-mt-wm 或 open-mt-groupbuy 的实现
})
```

## 3. invokeMap 更新

所有文件中找到 `invokeMap` 定义，添加新平台映射：

```typescript
1000: 'open-xxx-platform',
```

**文件列表**:
- src/components/AuthButton/index.vue
- src/views/shop/MtFeatureV2.vue (搜索 `invokeMap`，有2处)
- src/views/shop/MtFeatureV2Operation.vue (2处)
- src/views/shop/MtFeatureV2Functional.vue (2处)
- src/views/shop/components/ShopHeader.vue
- src/views/shop/componentsV2/ShopHeader.vue
- src/views/shop/components/Screen.vue
- src/views/shop/components/ShopTable.vue
- src/views/shop/components/ShopTableForList.vue
- src/views/shop/components/ShopTableOperate.vue
- src/views/shop/componentsV2/ShopTable.vue
- src/views/shop/componentsV2/ShopTableForList.vue
- src/views/shop/componentsV2/ShopTableOperate.vue
- src/views/shopCopy/components/ShopMoveList.vue
- src/composables/useOpenApp.ts

## 4. shopTypeOptions 更新

在数组末尾添加：
```typescript
{ label: '新平台', value: ShopType.新平台 },
```

**文件列表**:
- src/views/shop/MtFeatureV2.vue
- src/views/shop/MtFeatureV2Operation.vue
- src/views/shop/MtFeatureV2Functional.vue
- src/views/team/SystemConfig.vue
- src/views/team/FunctionPrice.vue
- src/views/team/Apply.vue
- src/views/team/ToolBox.vue
- src/views/team/FoodMoveRule.vue

## 5. setCookies 逻辑

在 `shop_type == 7` 的 else if 之后添加：

```typescript
} else if (row.shop_type == 1000) {
  // 新平台
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://xxx.com')
}
```

**文件列表**:
- src/views/shop/components/ShopTableOperate.vue
- src/views/shop/componentsV2/ShopTableOperate.vue
- src/views/shop/components/ShopTableForList.vue
- src/views/shop/componentsV2/ShopTableForList.vue
- src/views/shop/components/ShopTable.vue (注意这里用 `await electron.setCookies`)
- src/views/shop/componentsV2/ShopTable.vue (注意这里用 `await electron.setCookies`)

## 6. openWin 逻辑

在 `shop_type == 7` 的 else if 之后添加：

```typescript
} else if (row.shop_type == 1000) {
  globalThis.electron.openWin(`https://xxx.com`, row.office_id, row.cookies, row.name)
}
```

**文件列表**:
- src/views/shop/components/ShopTableForList.vue
- src/views/shop/componentsV2/ShopTableForList.vue

## 7. webview src 配置

### src/views/shop/componentsV2/ShopTableOperate.vue

找到 webview 的 `:src` 属性（很长的三元表达式），在末尾添加新平台：

```html
: item.shop_type == 1000
  ? 'https://xxx.com'
  : ''
```

## 8. ShopBackendManager 配置

### src/views/shop/ShopBackendManager.vue

**platformConfig** (搜索 `const platformConfig`):
```typescript
1000: { name: '新平台', icon: 'icon-name' },
```

**getShopUrl / urlMap** (搜索 `const getShopUrl` 或其内部的 `urlMap`):
```typescript
1000: 'https://xxx.com',
```

**getShortcutUrls / shortcuts** (搜索 `const getShortcutUrls`):
```typescript
1000: {
  product: null,
  activity: null,
  order: null,
  promote: null
},
```

**platformCookieDomains** (搜索 `const platformCookieDomains`):
```typescript
1000: ['https://xxx.com'],
```

## 9. 路由配置

### src/router/modules/shop-copy.ts

在 children 数组中添加新路由：

```typescript
{
  path: 'xxx-shop-copy',
  name: 'XxxShopCopy',
  component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
  meta: {
    title: '新平台',
    icon: 'icon-name',
    levelHidden: true,
    isCustomSvg: true,
    componentName: 'MtShopCopy',
    type: 1000,
    guard: ['ADMIN', 'AGENCY']
  },
},
```

## 修改顺序建议

1. 先定义 ShopType 枚举值（如果需要）
2. 添加图标配置
3. 添加 Electron 端 IPC handler 和配置
4. 批量更新 invokeMap（使用搜索替换）
5. 批量更新 shopTypeOptions
6. 批量更新 setCookies 逻辑
7. 更新 openWin 逻辑
8. 更新 webview src
9. 更新 ShopBackendManager 所有配置
10. 添加路由（如需要）
11. 测试验证
