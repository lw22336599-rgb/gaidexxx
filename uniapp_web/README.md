# uniapp_web（移动端壳工程）

位于 `D:\gaidexxxx\uniapp_web`，与 PC 项目 `faster-move-web` 同级。

## 说明

- 仓库内**未找到**名为 `pc_web` 的目录，HTTP 与后端字段约定参考 **`../faster-move-web`**：
  - `faster-move-web/src/utils/request.ts`（axios 拦截、Token、业务 code）
  - `faster-move-web/src/config/net.config.ts`（`successCode`、`statusName`、`messageName`）
- 本工程使用 **`uni.request`** 在 `src/utils/request.ts` 中做了**同约定**的薄封装，便于后续按 PC 的 `src/api` 模块拆分接口文件。

## 目录约定

| 路径 | 用途 |
|------|------|
| `src/pages/*` | 主包页面（`pages.json` 主路由） |
| `src/package-demo/*` | 分包示例根目录（可按业务再建 `package-shop` 等） |
| `src/api/*` | 业务接口模块（当前仅 `index.ts` 占位出口） |
| `src/utils/request.ts` | 统一请求 |
| `src/config/http.ts` | 网络常量（对齐 PC `net.config`） |
| `src/types/http.ts` | 通用响应类型 |

## 环境变量

- `.env.development` / `.env.production` 中的 `VITE_APP_BASE_API`：接口根地址，请按实际后端修改。

## 开发

```bash
npm install
npm run dev:h5
```

其他端命令见 `package.json` 的 scripts。
