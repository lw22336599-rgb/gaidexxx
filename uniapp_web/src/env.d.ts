/// <reference types="vite/client" />

declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

interface ImportMetaEnv {
  /** H5：uni.request / SSE 强制直连 PC 端 Vite（如 http://10.10.10.177:5200），不设则用内置默认 */
  readonly VITE_UNI_FORCE_API_BASE: string;
  /** 与 VITE_UNI_FORCE_API_BASE 一致时为：移动端走 PC :5200 代理 /seed（勿直连 :3000） */
  readonly VITE_UNI_FORCE_BRIDGE_BASE: string;
  readonly VITE_APP_BASE_API: string;
  /** 资源与兼容用基址（与 FORCE 同机时可都指向 :5200） */
  readonly VITE_DEV_API_BASE: string;
  readonly VITE_REAL_BASE_URL: string;
  readonly VITE_MOCK_BASE_URL: string;
  readonly VITE_APP_BASE_URL: string;
  /** 仅开发：Vite 将 /proxy 转发到此地址（见 vite.config.ts） */
  readonly VITE_PROXY_TARGET: string;
  /** H5 内嵌 faster-move-web 完整后台的根地址（无尾斜杠），如 http://10.10.10.177:5200 */
  readonly VITE_PC_ADMIN_ORIGIN: string;
  /** H5 为 true 时启动即整页跳转到 PC 管理端（不再走 uni 页面） */
  readonly VITE_H5_ENTRY_PC: string;
  /** 与 VITE_H5_ENTRY_PC 联用：hash 路径，如 /index 或 /user-operate/stores */
  readonly VITE_H5_ENTRY_PC_HASH: string;
  /** 目标局域网 IP（与 VITE_DEV_API_BASE 同机）；若本机网卡具备该地址则 Vite 绑定之 */
  readonly VITE_LAN_ENTRY_HOST: string;
  readonly VITE_DEV_HOST: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_DEV_BIND_POLICY: string;
  /** 仅开发：api-dev-bridge 转发目标（见 scripts/api-dev-bridge.mjs） */
  readonly API_UPSTREAM: string;
  /** true 时启用本地 Mock 登录与 getUserInfo（仅用于开发） */
  readonly VITE_USE_MOCK: string;
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
