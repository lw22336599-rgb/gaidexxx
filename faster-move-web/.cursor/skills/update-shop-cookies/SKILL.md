---
name: update-shop-cookies
description: 更新店铺后台打开时的 Cookie 设置逻辑。当新增店铺平台类型、现有平台 Cookie 域名不全导致后台无法正常登录、或需要为某平台补充设置更多域名时使用此 skill。
---

# 更新店铺后台 Cookie 设置逻辑

## 背景

打开店铺后台时，系统需要向 webview 的 session 注入 Cookie。Cookie 必须按**域名**分别设置，缺少任何一个相关域名都会导致对应请求无法携带认证信息，造成后台登录失效。

## 需要修改的文件（共 7 处）

| 文件 | 类型 |
|------|------|
| `src/views/shop/ShopBackendManager.vue` | `platformCookieDomains` 配置对象 |
| `src/views/shop/components/ShopTable.vue` | `await electron.setCookies(...)` |
| `src/views/shop/componentsV2/ShopTable.vue` | `await electron.setCookies(...)` |
| `src/views/shop/components/ShopTableForList.vue` | `globalThis.electron.setCookies(...)` |
| `src/views/shop/componentsV2/ShopTableForList.vue` | `globalThis.electron.setCookies(...)` |
| `src/views/shop/components/ShopTableOperate.vue` | `globalThis.electron.setCookies(...)` |
| `src/views/shop/componentsV2/ShopTableOperate.vue` | `globalThis.electron.setCookies(...)` |

## 各平台当前域名配置

```
shop_type 1   美团餐饮:     https://e.waimai.meituan.com
shop_type 2   饿了么餐饮:   https://melody.shop.ele.me
shop_type 3   美团闪购:     https://shangoue.meituan.com
                             https://e.waimai.meituan.com
                             https://waimaie.meituan.com
shop_type 4   美团医药:     https://yiyao.meituan.com
                             https://e.waimai.meituan.com
                             https://waimaie.meituan.com
shop_type 5   饿百零售:     https://nr.ele.me
                             https://melody.shop.ele.me
                             https://ele.me
shop_type 6   京东到家:     https://store.jddj.com
                             https://order.jddj.com
                             https://sff.jddj.com
                             https://trade.m.jd.com
                             https://trade.jd.com
                             https://api.m.jd.com
                             https://passport.jd.com
                             https://sso.jd.com
shop_type 7   抖音即时零售:  https://jsls.jinritemai.com
shop_type 1000 美团团购:    https://ecom.meituan.com
                             https://meituan.com
                             https://dianping.com
                             https://e.dianping.com
shop_type 1001 京东团购:    https://store.jddj.com
```

> **注意**：Electron `cookies.set()` 会自动将域名规范化，加上前缀点（如 `meituan.com` → `.meituan.com`），使 Cookie 对该域名的所有子域名生效。

## 操作步骤

### 1. 确认需要补充/新增的域名

通过以下方式判断：
- 用户反馈某平台后台打开后未登录或接口报错
- 在 DevTools → Application → Cookies 中查看实际使用的域名
- 参考截图中"有问题的 Cookie"过滤器列出的域名

### 2. 修改 ShopBackendManager.vue

定位 `platformCookieDomains` 对象，按以下格式添加/修改域名数组：

```typescript
const platformCookieDomains: Record<number, string[]> = {
  // ...
  1000: [ // 美团团购
    'https://ecom.meituan.com',
    'https://meituan.com',
    'https://dianping.com',
    'https://e.dianping.com'
  ],
}
```

### 3. 修改其余 6 个文件

在 `shop_type == <目标类型>` 的分支中，按相同模式追加 `setCookies` 调用：

**async/await 风格（ShopTable.vue 两个文件）：**
```typescript
} else if (row.shop_type == 1000) {
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://ecom.meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://dianping.com')
  await electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.dianping.com')
}
```

**同步风格（ShopTableForList.vue / ShopTableOperate.vue 四个文件）：**
```typescript
} else if (row.shop_type == 1000) {
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://ecom.meituan.com')
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://dianping.com')
  globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.dianping.com')
}
```

### 4. 验证修改

使用 ripgrep 确认所有文件都已更新：

```
rg "shop_type == 1000" src/views/shop/ -A 5
```

确保每处 `shop_type == 1000` 分支下都有完整的域名列表。

## 快速定位

搜索所有 Cookie 设置位置：
```
rg "ecom\.meituan\.com" src/
```

搜索指定平台的所有 Cookie 调用：
```
rg "shop_type == 1000" src/views/shop/ -l
```
