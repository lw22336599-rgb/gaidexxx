# Web 资源热更新使用说明

## 📋 功能概述

Web 资源热更新功能允许在不重新安装整个 Electron 应用的情况下，只更新 Vue 编译产物（dist 目录）。用户可以快速获得最新的前端功能，无需下载完整的安装包。

## 🎯 核心特性

- ✅ **增量更新**: 只更新 Web 静态资源，下载包通常只有几 MB
- ✅ **自动回退**: 更新失败自动使用内置资源，不影响应用启动
- ✅ **版本管理**: 自动对比版本号，只下载新版本
- ✅ **更新说明**: 显示详细的更新内容
- ✅ **用户友好**: 提供重启选项，用户可选择立即应用或稍后应用

## 📦 打包 Web 资源

### 1. 执行打包命令

```bash
npm run build:web-resources
```

### 2. 打包流程

执行后会自动完成以下步骤：

1. **编译 Vue 项目** - 执行 `vite build` 生成 dist 目录
2. **自动递增版本号** - 修订号自动 +1（如 5.3.9 → 5.3.10）并更新 `package.json`
3. **读取更新说明** - 从 `release-notes-web.txt` 获取 Web 资源更新内容
4. **生成版本文件** - 创建 `dist/version.json`
5. **压缩资源包** - 将 dist 目录打包成 `dist/web-resources-[版本号].zip`

### 3. 产物说明

打包完成后会生成：

```
dist/
├── index.html                    # 主页面
├── assets/                       # 静态资源
│   ├── index-xxx.js
│   └── index-xxx.css
├── version.json                  # 版本信息（包含更新说明）
└── web-resources-5.3.9.zip      # 完整压缩包（包含版本号，用于上传服务器）
```

### 4. version.json 格式

```json
{
  "version": "5.3.10",
  "downloadUrl": "http://update.wmzdb.shop/disk/web-resources-5.3.10.zip",
  "updateTime": "2026-01-20 10:30:00",
  "buildTime": "2026-01-20 10:30:00",
  "releaseNotes": "【新功能】\n1. ⭐ 新增店铺营业数据消息推送功能\n...",
  "description": "Web 资源更新"
}
```

## 🚀 部署到服务器

### 上传文件

将以下两个文件上传到更新服务器：

1. **version.json** → `http://update.wmzdb.shop/disk/version.json`
2. **web-resources-[版本号].zip** → `http://update.wmzdb.shop/disk/web-resources-[版本号].zip`

例如版本 5.3.9：
- `version.json` → `http://update.wmzdb.shop/disk/version.json`
- `web-resources-5.3.9.zip` → `http://update.wmzdb.shop/disk/web-resources-5.3.9.zip`

### 注意事项

- ✅ 压缩包文件名**包含版本号**，与 `version.json` 中的 `downloadUrl` 完全一致
- 服务器可以同时保留多个版本的压缩包，便于版本管理和回滚
- 每次更新只需替换 `version.json`，压缩包保持不变
- 服务器需要支持 CORS（如果使用 HTTPS）
- 建议使用 CDN 加速下载

## 🔄 更新流程

### 应用启动时

1. **检查更新** - 应用启动时自动检查 Web 资源更新
2. **对比版本** - 对比本地版本和远程版本
3. **下载资源** - 发现新版本时自动下载（后台静默）
4. **解压资源** - 下载完成后解压到外部目录
5. **提示重启** - 弹出对话框询问是否立即重启

### 资源加载优先级

```
启动时:
1. 检查外部资源目录 (userData/web-resources/)
2. 如果存在且有效 → 加载外部资源 ✅
3. 如果不存在或损坏 → 回退到内置资源 ✅
```

### 外部资源目录

- **Windows**: `C:\Users\[用户名]\AppData\Roaming\alien\web-resources\`
- **macOS**: `~/Library/Application Support/alien/web-resources/`
- **Linux**: `~/.config/alien/web-resources/`

## 🎨 用户体验

### 更新对话框

下载完成后会显示：

```
┌─────────────────────────────────────┐
│  发现新版本 v5.3.10                 │
├─────────────────────────────────────┤
│  已下载最新的 Web 资源，            │
│  是否立即重启应用以应用更新？      │
│                                     │
│  【新功能】                         │
│  1. ⭐ 新增店铺营业数据消息推送    │
│  2. ⭐ 新增IM客服集中服务功能      │
│  ...                                │
│                                     │
│  [立即重启]  [稍后重启]             │
└─────────────────────────────────────┘
```

### 用户选择

- **立即重启**: 应用会自动重启，重启后使用新资源
- **稍后重启**: 关闭对话框，下次启动时自动使用新资源

## 🛡️ 容错机制

### 网络异常

- 请求超时（30秒）→ 跳过更新，使用现有资源
- 下载失败 → 跳过更新，使用现有资源
- 服务器错误 → 跳过更新，使用现有资源

### 资源损坏

- 解压失败 → 自动恢复备份资源
- index.html 不存在 → 回退到内置资源

### 启动保障

- 所有更新操作都不会阻塞应用启动
- 更新失败不会抛出异常
- 保证应用始终能正常进入

## 🔧 开发调试

### 本地测试

1. 修改 `src-electron/webResourceUpdater.js` 中的 `UPDATE_CHECK_URL`
2. 启动本地服务器提供 version.json 和 zip 文件
3. 运行应用测试更新流程

### 日志查看

日志文件位置：
- **Windows**: `%USERPROFILE%\AppData\Roaming\alien\logs\main.log`
- **macOS**: `~/Library/Logs/alien/main.log`

搜索关键词：`[Web更新]` 或 `[Web资源]`

## 📝 版本发布流程

### 完整发布流程

1. **更新版本号** - 修改 `package.json` 中的 `version`
2. **编写更新说明** - 更新 `release-notes.txt`（完整包）和 `release-notes-web.txt`（Web 资源）
3. **打包 Web 资源** - 运行 `npm run build:web-resources`
4. **上传到服务器** - 上传 `version.json` 和 `web-resources-[版本号].zip`
5. **打包完整应用** - 运行 `npm run build:win`（可选）

### Web 资源单独更新

如果只是前端代码修改，可以只更新 Web 资源：

1. 修改前端代码
2. **编写 Web 资源更新说明** - 更新 `release-notes-web.txt`
3. 打包 Web 资源（版本号自动递增）
   ```bash
   npm run build:web-resources
   ```
4. 上传到服务器
5. 用户启动应用即可自动更新

**注意**: 版本号会自动递增（修订号 +1），无需手动修改 `package.json`

### 更新说明文件说明

- **release-notes.txt** - 完整包更新说明（Electron 主进程 + Web 资源）
- **release-notes-web.txt** - Web 资源更新说明（仅前端代码）

两个文件独立维护，职责分明。

## ⚠️ 注意事项

1. **版本号管理**: 确保每次发布都递增版本号
2. **更新说明维护**:
   - `release-notes-web.txt` - 用于 Web 资源更新
   - `release-notes.txt` - 用于完整包更新
3. **测试验证**: 发布前在本地测试更新流程
4. **服务器可用性**: 确保更新服务器稳定可访问
5. **Electron API 变更**: 如果涉及 Electron 主进程修改，必须发布完整包

## 🎯 最佳实践

1. **频繁更新**: 利用 Web 资源更新快速迭代前端功能
2. **完整更新**: 主进程或依赖变更时使用完整包更新
3. **版本规范**: 遵循语义化版本规范（主版本.次版本.修订号）
4. **测试环境**: 先在测试服务器验证更新流程
5. **灰度发布**: 可以分批次更新不同用户

## 🐛 常见问题

### Q: 更新失败怎么办？
A: 应用会自动回退到内置资源或上一版本，不影响使用。

### Q: 如何强制更新？
A: 删除外部资源目录，应用会重新下载最新版本。

### Q: 更新需要多久？
A: 通常只需 10-30 秒（取决于网络速度），远快于完整安装包。

### Q: 可以跳过版本更新吗？
A: 可以，用户选择"稍后重启"即可继续使用当前版本。

### Q: 如何回退到旧版本？
A: 只需发布一个版本号更小的更新包即可（需设置允许降级）。

## 📞 技术支持

如有问题，请查看日志文件或联系技术支持团队。
