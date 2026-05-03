/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 与 faster-move-web 一致：接口根地址（H5 开发可配 `/proxy` 走 Vite 代理） */
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_BASE_API: string;
  /** 仅开发：Vite 将 /proxy 转发到此地址（见 vite.config.ts） */
  readonly VITE_PROXY_TARGET: string;
  /** 仅开发：api-dev-bridge 转发目标（见 scripts/api-dev-bridge.mjs） */
  readonly API_UPSTREAM: string;
  /** true 时启用本地 Mock 登录与 getUserInfo（仅用于开发） */
  readonly VITE_MOCK_AUTH: string;
  readonly VITE_MOCK_DEFAULT_PHONE: string;
  readonly VITE_MOCK_SESSION_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
