# 零售类店铺 Cookie 设置域名修复说明

## 问题描述

在删除 cookie 设置成功的调试日志后，用户反馈美团闪购、美团医药、饿百零售店铺无法打开后台。

经检查发现问题不是删除日志导致的，而是之前在 `ShopTable.vue` 的 `setShopCookies` 函数中添加的域名不正确。

## 问题原因

### 1. 美团闪购（shop_type == 3）
**错误的域名：**
- `https://waimai.meituan.com` ❌（错误）
- `https://meituan.com` ❌（不需要）

**正确的域名：**
- `https://shangoue.meituan.com` ✓
- `https://e.waimai.meituan.com` ✓
- `https://waimaie.meituan.com` ✓（修正）

### 2. 美团医药（shop_type == 4）
**错误的域名：**
- `https://yiyao.meituan.com` ❌（缺少路径）
- `https://waimai.meituan.com` ❌（错误）
- `https://meituan.com` ❌（不需要）

**正确的域名：**
- `https://yiyao.meituan.com/main/frame` ✓（修正）
- `https://e.waimai.meituan.com` ✓
- `https://waimaie.meituan.com` ✓（修正）

### 3. 饿百零售（shop_type == 5）
**错误的域名：**
- `https://shop.ele.me` ❌（不够精确）

**正确的域名：**
- `https://nr.ele.me` ✓
- `https://melody.shop.ele.me` ✓（修正）
- `https://ele.me` ✓

## 修复内容

### 文件：`src/views/shop/components/ShopTable.vue`

#### 修复前：
```typescript
} else if (row.shop_type == 3) {
  // 美团闪购
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://shangoue.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
} else if (row.shop_type == 4) {
  // 美团医药
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://yiyao.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
}
```

#### 修复后：
```typescript
} else if (row.shop_type == 3) {
  // 美团闪购 - 需要设置到多个美团相关域名
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://shangoue.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimaie.meituan.com')
} else if (row.shop_type == 4) {
  // 美团医药 - 需要设置到多个美团相关域名
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://yiyao.meituan.com/main/frame')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://waimaie.meituan.com')
}
```

## 关键修改点

1. **美团闪购：** 移除了错误的 `waimai.meituan.com` 和不必要的 `meituan.com`，改用正确的 `waimaie.meituan.com`

2. **美团医药：**
   - 补充完整路径 `yiyao.meituan.com/main/frame`
   - 移除了错误的 `waimai.meituan.com` 和不必要的 `meituan.com`
   - 改用正确的 `waimaie.meituan.com`

3. **饿百零售：** 将 `shop.ele.me` 改为更精确的 `melody.shop.ele.me`

## 测试验证

修复后需要测试以下场景：

1. ✅ 美团闪购店铺点击"打开店铺"能正常进入后台
2. ✅ 美团医药店铺点击"打开店铺"能正常进入后台
3. ✅ 饿百零售店铺点击"打开店铺"能正常进入后台
4. ✅ 在 webview 中能正常展示店铺信息
5. ✅ Cookie 设置成功，能保持登录状态

## 注意事项

1. 修改 Electron 相关代码后，需要重启应用才能生效
2. Cookie 域名设置必须精确匹配，否则会导致认证失败
3. 某些平台的后台地址需要包含完整路径（如美团医药的 `/main/frame`）
4. 建议在修改前参考 `src/utils/openShopWin.ts` 中的正确域名配置

## 相关文件

- `src/views/shop/components/ShopTable.vue` - setShopCookies 函数
- `src/utils/openShopWin.ts` - openWindowShop 函数（参考正确的域名配置）
- `src-electron/main.js` - set-cookie IPC handler

## 修复时间

2026-01-21

## 修复人员

AI Assistant (Cursor)
