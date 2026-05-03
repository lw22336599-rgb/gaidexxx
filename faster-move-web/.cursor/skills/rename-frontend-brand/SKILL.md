---
name: rename-frontend-brand
description: 更换前端软件品牌名和主要图标（例如从“外星人助手”改成“极狐”），适用于 faster-move-web 前端 + Electron 桌面应用。
---

# 更换前端软件品牌名（faster-move-web）

## 使用时机

- 需要把整个前端/Electron 应用从旧品牌名切到新品牌名，例如从“外星人助手”改成其它名字。
- 同时需要更新桌面应用的安装名称、快捷方式名称、标题栏、登录页文案、Portal 展示、支付弹窗里的应用名等前端可见位置。
- 希望后续再次换品牌时，能复用一套稳定流程，避免遗漏。

> **约定：**
> - 旧中文名：`旧品牌名`（例如：外星人助手）
> - 新中文名：`新品牌名`（例如：极狐）
> - 旧英文名（package 名/域名前缀）：`alien`
> - 新英文名：`newname`（比如用新中文名的拼音，如 `jihu`）

在真正执行前，请先在脑子里替换好这 4 个占位符：`旧品牌名`、`新品牌名`、`alien`、`newname`。

---

## 第一步：全局替换品牌名

### 1.1 核心配置 + HTML 标题

1. 打开 `src/config/setting.config.ts`，修改：
   - `title: '旧品牌名'` → `title: '新品牌名'`
   - `abbreviation: '旧品牌名'` → `abbreviation: '新品牌名'`

2. 打开 `index.html`，修改：
   - `<title>旧品牌名</title>` 或类似包含旧品牌名的标题 → 替换为 `新品牌名`。

3. 打开 `website.html`，修改：
   - `<title>旧品牌名 ...</title>` → 将其中的 `旧品牌名` 替换为 `新品牌名`。

### 1.2 路由 meta / UserAgreement 标题

1. 打开 `src/router/index.ts`，找到：

   ```ts
   {
     path: '/userAgreement',
     name: 'UserAgreement',
     component: () => import('/@/views/login/UserAgreement.vue'),
     meta: {
       title: '“旧品牌名”SAAS软件用户服务协议',
       hidden: true,
     },
   },
   ```

   改为：

   ```ts
   title: '“新品牌名”SAAS软件用户服务协议',
   ```

2. 打开 `src/views/login/Login.vue`，将底部用户协议文本里的：
   - `《旧品牌名用户服务协议》` → `《新品牌名用户服务协议》`

3. 打开 `src/views/login/UserAgreement.vue`，全文把出现的 `旧品牌名` 替换为 `新品牌名`，包括：
   - 标题 `<h1>` 里的 `“旧品牌名”SAAS软件用户服务协议`
   - 正文里的 `“旧品牌名”SAAS软件`、`旧品牌名工作室` 等描述

> **注意**：`UserAgreement.vue` 是长文档，优先通过 IDE 的“当前文件替换”把 `旧品牌名` → `新品牌名`，再人工扫一遍是否有未替换的变体（带引号、带 SAAS 后缀等）。

### 1.3 Portal / 工作台 / 数据大屏 展示名称

1. `src/views/portal/vabAutoComponents/PortalHeader.vue`
   - `<span class="logo-title">旧品牌名</span>` → `新品牌名`

2. `src/views/portal/Portal.vue`
   - 左侧菜单中带品牌名的介绍项：
     - `旧品牌名：全新一代前端模板` → `新品牌名：全新一代前端模板`
   - 描述区标题：
     - `.clip` 文本内的 `旧品牌名` → `新品牌名`

3. `src/views/index/vabAutoComponents/WorkbenchHeader.vue`
   - 主标题 `旧品牌名 工作台` → `新品牌名 工作台`

4. `src/views/index/vabAutoComponents/DataScreenHeader.vue`
   - 主标题 `旧品牌名 数据大屏` → `新品牌名 数据大屏`
   - 伪元素 `content: 'Vue Shop Vite 数据大屏'` 如需要品牌化，也替换为 `新品牌名 数据大屏`。

### 1.4 支付弹窗 / 运营界面中的应用名称

1. `src/views/shop/PayDialog.vue`
   - 对话框标题、标题文案中的 `旧品牌名` → `新品牌名`
   - 支付确认框中：
     - `"应用名称" 行的 `旧品牌名` → `新品牌名`

2. `src/views/shop/components/PayDialog.vue`
   - 对话框标题 `title="旧品牌名"` → `title="新品牌名"`
   - 卡片标题中的 `旧品牌名` → `新品牌名`
   - 支付确认框 `"应用名称"` 行中的 `旧品牌名` → `新品牌名`

3. `src/views/shop/components/PayDialogUser.vue`
   - 同上：标题、标题文字、支付确认 `"应用名称"` 中的 `旧品牌名` → `新品牌名`

4. `src/views/shop/componentsV2/PayDialogUser.vue`
   - 标题 `title="旧品牌名"` → `title="新品牌名"`
   - 标题文字中的 `旧品牌名` → `新品牌名`
   - 支付确认 `"应用名称"` 行中的 `旧品牌名` → `新品牌名`

5. 其它零星文案示例：
   - `src/views/operate/scrollTop/index.vue` 中列表项 `旧品牌名 - {{ item }}` → `新品牌名 - {{ item }}`
   - `src/views/shopCopy/components/MoveShop.vue` 中提示语：

     ```ts
     '操作将授权"旧品牌名"将您此次任务数据...'
     ```

     → 改为 `"新品牌名"`。

### 1.5 Electron / 构建配置中的品牌名

1. 打开 `package.json`：
   - `"description": "旧品牌名"` → `"description": "新品牌名"`
   - `"build.productName": "旧品牌名"` → `"新品牌名"`
   - `build.nsis.guid: "旧品牌名"` → `"新品牌名"`（或带测试后缀）
   - `build.nsis.shortcutName: "旧品牌名"` → `"新品牌名"`

2. 打开 `build/oem/index.js`（模版配置）：
   - `guid: "旧品牌名-测试版"` → `"新品牌名-测试版"`
   - `shortcutName: "旧品牌名-测试版"` → `"新品牌名-测试版"`

3. 打开 `build/oem/example/example.json`：
   - 同样把 `"guid"`、`"shortcutName"` 中的 `旧品牌名` 改成 `新品牌名`。

4. 如有旧文本“重启旧品牌名”的提示（例如 `src-electron/fridaServer.js` 中日志）：
   - 可以按需替换为 “重启新品牌名”，避免用户看到旧品牌。

> **可选**：有些工具脚本（如 `build/oem/index.js`）会按 `productName` 生成构建配置，内部已经使用传入的 `productName` 覆盖 `nsis.guid` 和 `shortcutName`，如果你不想动“测试版”模版，可以只在调用时传入新的 `productName`。

---

## 第二步：全局替换英文名（package 名）

> **目标**：保持包名、appId 等从 `alien` 切到新的英文名 `newname`。

1. 打开 `package.json`：
   - `"name": "alien"` → `"name": "newname"`
   - `"build.appId": "com.alien.admin"` → `"com.newname.admin"`
   - 如有版权字段：
     - `"copyright":
       "com.alien.admin © 2025"` → `"com.newname.admin © 2025"`

2. 根据 README 中的说明做一次快速自查：

   ```json
   "name": "alien",
   "build": {
     "productName": "旧品牌名",
     "appId": "com.alien.admin",
     ...
   }
   ```

   确保：

   - `"name"` 已改为新英文名；
   - `productName` 已是新中文品牌名；
   - `appId`、版权里的 `alien` 已替换为新英文名。

> **注意**：更改 `appId` 会影响 Windows 安装包的升级行为，通常只在完全换品牌/新产品线时使用。

---

## 第三步：更新前端图标（Logo）

> **限制说明（对 AI）**：当前环境下无法直接生成 `.png` / `.ico` 等二进制文件，只能：
> - 修改 SVG；
> - 修改引用路径；
> - 提示人工替换 `png/ico` 文件。

### 3.1 前端顶部 / Portal Logo（SVG）

1. 顶部 Portal Header 使用的是：
   - `src/assets/avatar.svg`
   - `src/views/portal/vabAutoComponents/PortalHeader.vue` 中：

     ```scss
     background: url('/@/assets/avatar.svg') center center no-repeat;
     ```

2. 将 `avatar.svg` 内容替换为新品牌的 SVG（例如狐狸图标），保持尺寸与 viewBox 合理。

3. 如果有 `src/assets/logo.svg` 还在使用，也可以同步更新为新品牌 SVG，或统一改为引用 `avatar.svg`。

### 3.2 Electron 图标（PNG / ICO）

参考 README 中列出的路径：

- `/assets/home_images/zdblogo.png`
- `/public/logo.ico`
- `/public/favicon.ico`
- `/public/logo.png`

在当前仓库中常见的是：

- `public/favicon.svg`（浏览器图标）
- `build/oem/**/public/logo.ico` / `logo.png`（各 OEM 构建目录）

**操作步骤：**

1. 手动在本地用图标工具（如 Image2icon、在线 ICO 生成器）根据新品牌 Logo 生成：
   - `logo.png`（推荐 512×512 或 256×256）
   - `logo.ico`（多尺寸 ICO）

2. 用生成的文件覆盖对应位置：
   - `public/logo.ico`、`public/logo.png`（如存在）
   - `build/oem/<productName>/public/logo.ico` 和 `logo.png`

3. 如果存在 `favicon.svg`，可以视情况：
   - 继续沿用新的 `avatar.svg` 风格重新绘制一个简单版本；
   - 或保持原有 favicon，仅更新桌面端/页面内可见 logo。

> **关键点**：只要路径不变，Electron 和浏览器会自动使用新的图标文件，不需要改代码。

---

## 第四步：回归检查清单

品牌名和图标替换完后，按下面清单自测：

1. **启动页面 / 登录页**
   - 浏览器标题是否显示 `新品牌名`。
   - 登录页欢迎语、用户协议标题是否是 `新品牌名`。

2. **Portal / 工作台 / 数据大屏**
   - Portal 顶部 logo 形状是否已经是新图标。
   - Portal 左上角文字是否是 `新品牌名`。
   - 工作台/数据大屏标题是否已更新。

3. **店铺续费 / 支付弹窗**
   - 所有支付弹窗标题中的应用名是否是 `新品牌名`。
   - 支付确认对话框里 `"应用名称"` 字段是否显示为 `新品牌名`。

4. **协议与文案**
   - `UserAgreement.vue` 中是否还存在 `旧品牌名` 文本（可再用 `rg` / IDE 全局搜索确认）。
   - `src/views/operate/scrollTop/index.vue`、`MoveShop.vue` 等演示/提示文案是否替换完。

5. **Electron 构建**
   - 打包出来的桌面应用名称、安装向导标题、桌面/开始菜单快捷方式显示的都是 `新品牌名`。
   - 双击安装包时的图标为新品牌 logo。

> **建议**：执行完所有替换后，再用一次全局搜索：
>
> - 搜索 `旧品牌名`，理论上只应剩下历史文档/README 示例（如果你选择保留）。
> - 搜索 `alien`，只应出现在老历史说明或无关文本中，实际构建配置应该已经替换为新英文名。

---

## 快速命令参考（可选）

在终端中使用 `rg` 辅助查找：

```bash
# 查找所有旧品牌名
rg "外星人助手" src/ index.html website.html build/ package.json

# 查找所有旧英文名
rg "alien" package.json build/ src-electron
```

---

## 小结

更换前端品牌名的最小闭环包括：

- **配置**：`setting.config.ts`、`index.html`、`website.html`、`router meta`；
- **文案**：登录页、用户协议、Portal、工作台/数据大屏、支付/续费弹窗、提示文案；
- **构建**：`package.json` 中的 `name`、`productName`、`appId`、NSIS `guid`、`shortcutName`；
- **图标**：SVG（`avatar.svg` / `logo.svg`）+ PNG/ICO 文件（手动覆盖）。

严格按以上步骤执行，可以在不破坏现有功能的前提下，把前端整体切换到新的品牌名和图标。
