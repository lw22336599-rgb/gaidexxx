import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { NetworkInterfaceInfo } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 默认局域网后端/访问锚点（与 .env 可互相覆盖）；仅当本机网卡真实拥有该地址时才绑定 server.host */
const DEFAULT_LAN_ANCHOR = "10.10.10.177";

function isLanIpv4(n: NetworkInterfaceInfo): boolean {
  if (n.internal) return false;
  const fam = n.family;
  if (fam !== "IPv4" && fam !== 4) return false;
  return true;
}

function rankLanIp(ip: string): number {
  if (ip.startsWith("192.168.")) return 0;
  if (ip.startsWith("10.")) return 1;
  return 2;
}

/**
 * 本机可用局域网 IPv4 列表（排除链路本地、常见 Docker 私有段），
 * 排序：优先 192.168.*，其次 10.* ，其余。
 */
export function listLanIPv4Candidates(): string[] {
  const ifs = os.networkInterfaces();
  const cands: string[] = [];
  for (const name of Object.keys(ifs)) {
    for (const n of ifs[name] || []) {
      if (!isLanIpv4(n)) continue;
      const a = n.address;
      if (!a || a.startsWith("169.254.")) continue;
      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(a)) continue;
      cands.push(a);
    }
  }
  cands.sort((a, b) => rankLanIp(a) - rankLanIp(b) || a.localeCompare(b));
  return cands;
}

export function pickPrimaryLanIPv4(): string | null {
  const c = listLanIPv4Candidates();
  return c[0] ?? null;
}

/**
 * server.host 策略（手机需用局域网 IP 访问）：
 * 1）VITE_DEV_HOST 非空：强制绑定该地址（须为本机真实网卡 IP，否则报 EADDRNOTAVAIL）
 * 2）VITE_LAN_ENTRY_HOST（默认同 DEFAULT_LAN_ANCHOR）：若本机网卡列表含该 IP，则绑定之 → 可用 http://该IP:5173
 * 3）否则监听 0.0.0.0，控制台同时打印「目标局域网」与实际可达 IP
 */
function pickDevServerBindHost(env: Record<string, string>): string {
  const forced = (env.VITE_DEV_HOST || "").trim();
  if (forced) return forced;

  const preferredLan = ((env.VITE_LAN_ENTRY_HOST || "").trim() || DEFAULT_LAN_ANCHOR).trim();
  const cands = listLanIPv4Candidates();
  if (preferredLan && cands.includes(preferredLan)) return preferredLan;

  const lan192 = cands.find((ip) => ip.startsWith("192.168."));
  if (lan192) return lan192;

  const policy = (env.VITE_DEV_BIND_POLICY || "192168_first").trim().toLowerCase();
  if (policy === "192168_only") {
    console.warn(
      "[vite][H5] VITE_DEV_BIND_POLICY=192168_only 但未检测到 192.168.*，已改为监听 0.0.0.0；请连接 192.168 路由或设置 VITE_DEV_HOST"
    );
    return "0.0.0.0";
  }

  console.warn(
    "[vite][H5] 未检测到 192.168.* 网卡，server.host=0.0.0.0；手机请使用下方打印的「实际局域网 IP」（当前多为 10.* 等）"
  );
  return "0.0.0.0";
}

/** 控制台里给手机扫码/输入用的主机名（优先 192.168.*） */
function pickMobileUrlHost(bindHost: string): string {
  if (bindHost && bindHost !== "0.0.0.0") return bindHost;
  const cands = listLanIPv4Candidates();
  return cands.find((ip) => ip.startsWith("192.168.")) || cands[0] || "127.0.0.1";
}

function printMobileEntry(bindHost: string, port: number, env: Record<string, string>) {
  const preferredLan = ((env.VITE_LAN_ENTRY_HOST || "").trim() || DEFAULT_LAN_ANCHOR).trim();
  const hostForUrl = pickMobileUrlHost(bindHost);
  const externalHost = bindHost && bindHost !== "0.0.0.0" ? bindHost : hostForUrl;
  const idx = `http://${externalHost}:${port}/#/pages/index/index`;
  const storeUrl = `http://${externalHost}:${port}/#/pages/store/store`;
  console.log("\n========================================");
  console.log("[H5] External:", `http://${externalHost}:${port}/`);
  console.log(" ", "首页：", idx);
  console.log(" ", "门店 Tab：", storeUrl);
  if (externalHost !== preferredLan) {
    console.log("[H5] .env 目标主机：", preferredLan, "（当前绑定：", externalHost, "）");
  }
  if (bindHost === "0.0.0.0" || bindHost === "127.0.0.1") {
    console.log("[H5] 本机浏览器：", `http://127.0.0.1:${port}/#/pages/index/index`);
  } else {
    console.log(`[H5] dev server 已绑定网卡 ${bindHost}`);
  }
  console.log("========================================\n");
}

/** `/` 通配 → bridge；仅放行 Vite/uni 模块与静态，避免抢走页面与 HMR */
function uniBridgeRootBypass(req: {
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const raw = req.url || "";
  const pathOnly = raw.split("?")[0] || "";
  if (
    raw.startsWith("/@vite") ||
    raw.startsWith("/@fs") ||
    raw.startsWith("/@id") ||
    raw.startsWith("/__") ||
    raw.startsWith("/node_modules") ||
    raw.startsWith("/src/") ||
    raw.startsWith("/static/") ||
    raw.startsWith("/uni_modules") ||
    raw.startsWith("/h5/")
  ) {
    return raw;
  }
  if (
    /\.(vue|tsx?|jsx?|mjs|js|ts|css|scss|sass|less|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|map|wasm)(\?|$)/i.test(
      pathOnly,
    )
  ) {
    return raw;
  }
  if (req.method === "GET" && (req.headers.accept || "").includes("text/html")) {
    return raw;
  }
  // Vite bypass：仅 `string` 改写后走本地中间件；`false` 会令 dev server 直接 404，从不转发到 target
  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const bridgePort = Number(env.API_BRIDGE_PORT || process.env.API_BRIDGE_PORT || 3000) || 3000;
  const raw = (
    env.VITE_PROXY_TARGET ||
    process.env.VITE_PROXY_TARGET ||
    `http://${DEFAULT_LAN_ANCHOR}:${bridgePort}`
  ).trim();
  const proxyTarget = raw.endsWith("/") ? raw : `${raw}/`;
  const bridgeOrigin = proxyTarget.replace(/\/$/, "");

  const bindHost = pickDevServerBindHost(env);

  const devPort = Number(env.VITE_DEV_PORT || 5173) || 5173;

  const devCacheHeaders =
    mode === "development"
      ? {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        }
      : undefined;

  return {
    plugins: [
      uni(),
      {
        name: "log-lan-h5-url",
        configureServer(server) {
          server.httpServer?.once("listening", () => {
            const addr = server.httpServer?.address() as AddressInfo | string | null;
            const port = typeof addr === "object" && addr ? addr.port : devPort;
            console.log(
              `[vite][H5] 开发代理 /proxy、/ 通配(bridge 绕行 Vite 资源) → ${bridgeOrigin}`,
            );
            printMobileEntry(bindHost, port, env);
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      /** 默认优先 192.168.*（VITE_DEV_BIND_POLICY）；亦可 VITE_DEV_HOST 强制指定 */
      host: bindHost,
      port: devPort,
      strictPort: true,
      headers: devCacheHeaders,
      proxy: {
        "/proxy": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/proxy/, "") || "/",
        },
        "/admin": { target: bridgeOrigin, changeOrigin: true },
        "/homedata": { target: bridgeOrigin, changeOrigin: true },
        "/seed": { target: bridgeOrigin, changeOrigin: true },
        "/userManagement": { target: bridgeOrigin, changeOrigin: true },
        "/system": { target: bridgeOrigin, changeOrigin: true },
        "/api": { target: bridgeOrigin, changeOrigin: true },
        "/": {
          target: bridgeOrigin,
          changeOrigin: true,
          bypass: uniBridgeRootBypass,
        },
      },
    },
  };
});
