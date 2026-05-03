---
name: add-shop-platform
description: 添加新的店铺平台类型（如美团团购、京东团购等）。当用户需要新增 ShopType、添加新平台支持、扩展平台类型时使用此 skill。
---

# 添加新店铺平台

## 概述

添加新平台需要修改多个文件，涉及：图标、授权、门店管理、后台打开、cookies 设置等功能。

## 必须修改的文件清单

### 1. 图标配置
- `src/components/PlatformIcon/index.vue` - 添加 `case ShopType.新平台: return 'icon-name'`

### 2. Electron 端配置 (`src-electron/main.js`)

```javascript
// urlMap - 手动授权打开的 URL（在 open-auth-window handler 中）
const urlMap = {
  // ...
  1000: 'https://xxx.com',  // 新平台
}

// domainMap - 获取 cookies 的域名列表（在 get-auth-cookies handler 中）
const domainMap = {
  // ...
  1000: ['.xxx.com', 'xxx.com'],  // 新平台
}

// ⚠️ 如果新平台需要独立的添加门店流程，添加新的 IPC handler
ipcMain.handle('open-xxx-platform', async (event, row) => {
  let url = 'https://xxx.com'  // 新平台后台地址
  // ...
})
```

### 3. invokeMap 配置（添加门店按钮调用的 IPC）

**⚠️ 关键坑点：必须更新所有包含 `invokeMap` 的文件！**

需要更新的文件列表：
- `src/components/AuthButton/index.vue`
- `src/views/shop/MtFeatureV2.vue` (2处)
- `src/views/shop/MtFeatureV2Operation.vue` (2处)
- `src/views/shop/MtFeatureV2Functional.vue` (2处)
- `src/views/shop/components/ShopHeader.vue`
- `src/views/shop/componentsV2/ShopHeader.vue`
- `src/views/shop/components/Screen.vue`
- `src/views/shop/components/ShopTable.vue`
- `src/views/shop/components/ShopTableForList.vue`
- `src/views/shop/components/ShopTableOperate.vue`
- `src/views/shop/componentsV2/ShopTable.vue`
- `src/views/shop/componentsV2/ShopTableForList.vue`
- `src/views/shop/componentsV2/ShopTableOperate.vue`
- `src/views/shopCopy/components/ShopMoveList.vue`
- `src/composables/useOpenApp.ts`

```typescript
const invokeMap: Record<number, string> = {
  // ...
  1000: 'open-xxx-platform',  // 新平台
}
```

### 4. shopTypeOptions 配置（平台选择下拉框）

需要更新的文件：
- `src/views/shop/MtFeatureV2.vue`
- `src/views/shop/MtFeatureV2Operation.vue`
- `src/views/shop/MtFeatureV2Functional.vue`
- `src/views/team/SystemConfig.vue`
- `src/views/team/FunctionPrice.vue`
- `src/views/team/Apply.vue`
- `src/views/team/ToolBox.vue`
- `src/views/team/FoodMoveRule.vue`

```typescript
const shopTypeOptions = [
  // ...
  { label: '新平台', value: ShopType.新平台 },
]
```

### 5. setCookies 逻辑（内嵌 webview 打开后台）

**⚠️ 关键坑点：webview src 配置了不代表 cookies 设置了！**

需要更新的文件：
- `src/views/shop/components/ShopTableOperate.vue`
- `src/views/shop/componentsV2/ShopTableOperate.vue`
- `src/views/shop/components/ShopTableForList.vue`
- `src/views/shop/componentsV2/ShopTableForList.vue`
- `src/views/shop/components/ShopTable.vue`
- `src/views/shop/componentsV2/ShopTable.vue`

```typescript
} else if (row.shop_type == 1000) {
  // 新平台
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://xxx.com')
}
```

### 6. openWin 逻辑（独立窗口打开后台）

需要更新的文件：
- `src/views/shop/components/ShopTableForList.vue`
- `src/views/shop/componentsV2/ShopTableForList.vue`

```typescript
} else if (row.shop_type == 1000) {
  globalThis.electron.openWin(`https://xxx.com`, row.office_id, row.cookies, row.name)
}
```

### 7. webview src 配置

- `src/views/shop/componentsV2/ShopTableOperate.vue` - 模板中的 webview :src 三元表达式

### 8. ShopBackendManager 配置（店铺后台管理器窗口）

**⚠️ 关键坑点：这是独立窗口，有自己的配置，容易遗漏！**

文件：`src/views/shop/ShopBackendManager.vue`

```typescript
// platformConfig - 平台名称和图标
const platformConfig: Record<number, { name: string; icon: string }> = {
  // ...
  1000: { name: '新平台', icon: 'icon-name' },
}

// getShopUrl - 后台 URL
const urlMap: Record<number, string> = {
  // ...
  1000: 'https://xxx.com',
}

// getShortcutUrls - 快捷入口（可选）
const shortcuts: Record<number, Record<string, string | null>> = {
  // ...
  1000: {
    product: null,
    activity: null,
    order: null,
    promote: null
  },
}

// platformCookieDomains - cookies 域名配置
const platformCookieDomains: Record<number, string[]> = {
  // ...
  1000: ['https://xxx.com'],
}
```

### 9. 路由配置（店铺复制，按需）

文件：`src/router/modules/shop-copy.ts`

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

## 踩坑记录

### 坑1: invokeList vs invokeMap

**问题**: 原代码使用数组 `invokeList`，当 ShopType 值为 1000 时会创建巨大的稀疏数组。

**解决**: 将所有 `invokeList` 改为对象 `invokeMap: Record<number, string>`。

### 坑2: 添加门店 vs 手动授权 是不同流程

**问题**: 美团团购复用了 `open-mt-wm`，导致添加门店时打开了美团外卖的地址。

**流程区别**:
- 手动授权：`open-auth-window` → `urlMap` + `domainMap`
- 添加门店：`openBrowser` → `invokeMap` → 特定 IPC handler

**解决**: 为新平台创建独立的 IPC handler（如 `open-mt-groupbuy`）。

### 坑3: setCookies 逻辑遗漏

**问题**: webview src 配置了新平台 URL，但 setCookies 的 if-else 链中没有新平台，导致 cookies 未设置，显示登录页。

**解决**: 必须同时在 webview src 和 setCookies 逻辑中添加新平台。

### 坑4: ShopBackendManager 独立配置

**问题**: `ShopBackendManager.vue` 是独立的窗口组件，有自己的 `platformConfig`、`urlMap`、`platformCookieDomains`，容易遗漏。

**解决**: 添加新平台时必须检查此文件的所有配置项。

### 坑5: getSavedShopType 范围验证

**问题**: 原代码使用 `shopType >= 1 && shopType <= 8` 验证，新平台 1000 不在范围内。

**解决**: 改为 `shopTypeOptions.some(opt => opt.value === shopType)` 动态验证。

## 检查清单

添加新平台后，使用此清单验证：

```
[ ] PlatformIcon 图标显示正确
[ ] 手动授权能打开正确地址
[ ] 添加门店能打开正确地址
[ ] 门店管理页面显示新平台选项
[ ] 内嵌 webview 打开后台已登录（非登录页）
[ ] 独立窗口打开后台已登录
[ ] ShopBackendManager 多开窗口正常
[ ] 店铺复制路由正常（如需要）
```

## 快速搜索命令

查找所有需要修改的位置：

```bash
# 查找 invokeMap/invokeList
rg "invokeMap|invokeList" src/

# 查找 shopTypeOptions
rg "shopTypeOptions" src/

# 查找 setCookies 调用
rg "setCookies.*jinritemai" src/

# 查找 shop_type == 7 (最后一个平台，用于定位添加位置)
rg "shop_type == 7" src/

# 查找 platformCookieDomains
rg "platformCookieDomains" src/
```
