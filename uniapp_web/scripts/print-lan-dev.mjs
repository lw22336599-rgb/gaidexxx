/**
 * 同一路由器下调试：打印本机局域网 IP、H5 与 API 访问方式（非内嵌穿透，依赖局域网联通）。
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadDotEnv() {
  const p = path.join(root, ".env.development");
  if (!fs.existsSync(p)) return {};
  const txt = fs.readFileSync(p, "utf8");
  const o = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][\w]*)\s*=\s*(.*)$/);
    if (!m) continue;
    o[m[1]] = m[2].trim();
  }
  return o;
}

function listLanIpv4() {
  const c = [];
  for (const arr of Object.values(os.networkInterfaces())) {
    for (const n of arr || []) {
      const fam = n.family;
      if (fam !== "IPv4" && fam !== 4) continue;
      if (n.internal) continue;
      if (!n.address || n.address.startsWith("169.254.")) continue;
      c.push(n.address);
    }
  }
  return c;
}

const env = loadDotEnv();
const port = Number(env.VITE_DEV_PORT || 5173) || 5173;
const preferred = (env.VITE_LAN_ENTRY_HOST || "10.10.10.177").trim();
const cands = listLanIpv4();
const host = cands.includes(preferred) ? preferred : cands.find((a) => a.startsWith("192.168.")) || cands[0] || "127.0.0.1";
const pcBase = "http://10.10.10.177:5200";

console.log("\n========== 局域网实时预览（与电脑同 WiFi）==========");
console.log("【必做】先在项目根目录执行并保持窗口打开:  npm run dev:h5");
console.log("       否则本机没有进程监听 5173，浏览器会 ERR_CONNECTION_TIMED_OUT。");
console.log("       启动后请以终端里 [H5] External / Vite「Network」行为准打开页面。");
console.log("H5 访问（手机浏览器 / 内嵌 WebView 调试）:");
console.log(`  ${`http://${host}:${port}/#/pages/index/index`}`);
console.log("PC 后台（须先 npm run restart:pc-stack 或 faster-move-web 内 pnpm dev）:");
console.log(`  ${pcBase}/`);
console.log("业务 API：小程序/App 常直连 " + pcBase + "；H5 开发时 uni.request 走当前页.origin（5173）经 Vite 代理。");
console.log("微信小程序：");
console.log("  npm run dev:mp-weixin（监听源码变更自动重新编译；需在开发者工具勾选「不校验合法域名」以访问内网 API）");
console.log("App：");
console.log("  真机联调可用「运行 → 运行到手机或模拟器」自定义运行基座，或先用 H5 在同网段验证。");
console.log("当前检测到的 IPv4（可选作 VITE_LAN_ENTRY_HOST）：", cands.length ? cands.join(", ") : "（无）");
console.log("==================================================\n");
