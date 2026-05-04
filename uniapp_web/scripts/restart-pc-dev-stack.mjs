/**
 * 仅重启 PC 联调链：释放 3000 + 5200 → api-dev-bridge → faster-move-web（不停止 5173 H5）。
 * 用法：node scripts/restart-pc-dev-stack.mjs
 */
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

import { killPorts } from "./kill-dev-ports.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uniRoot = path.join(__dirname, "..");
const pcRoot = path.join(uniRoot, "..", "faster-move-web");

function readEnvPort(rootDir, fileName, key, fallback) {
  try {
    const p = path.join(rootDir, fileName);
    if (!fs.existsSync(p)) return fallback;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      if (t.slice(0, i).trim() !== key) continue;
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

const BRIDGE_PORT = readEnvPort(uniRoot, ".env.development", "API_BRIDGE_PORT", 3000);
const PC_PORT = 5200;

function waitPort(host, port, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tryOnce = () => {
      const s = createConnection({ port, host }, () => {
        s.destroy();
        resolve();
      });
      s.on("error", () => {
        s.destroy();
        if (Date.now() - t0 > timeoutMs) reject(new Error(`等待 ${host}:${port} 超时（${timeoutMs}ms）`));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

/** 本机 Vite 监听 0.0.0.0 时，127.0.0.1 可连；若仅绑定某网卡 IP，可改 hosts 顺序 */
async function waitPortFirstHosts(hosts, port, timeoutMs) {
  const per = Math.ceil(timeoutMs / Math.max(hosts.length, 1));
  let lastErr;
  for (const h of hosts) {
    try {
      await waitPort(h, port, per);
      return h;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`无法在候选主机上连通 :${port}`);
}

function prefixSpawn(tag, command, args, opts) {
  const child = spawn(command, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout?.on("data", (b) => process.stdout.write(`[${tag}] ${b}`));
  child.stderr?.on("data", (b) => process.stderr.write(`[${tag}] ${b}`));
  return child;
}

if (!fs.existsSync(pcRoot)) {
  console.error(`[restart-pc-dev-stack] 未找到 PC 工程: ${pcRoot}`);
  process.exit(1);
}

console.log("[restart-pc-dev-stack] 释放 bridge / PC Vite 占用端口…");
killPorts([BRIDGE_PORT, PC_PORT]);
await new Promise((r) => setTimeout(r, 1200));

const bridgePath = path.join(uniRoot, "scripts", "api-dev-bridge.mjs");
console.log(`[restart-pc-dev-stack] 启动 api-dev-bridge :${BRIDGE_PORT}…`);
const bridge = prefixSpawn("bridge", process.execPath, [bridgePath], {
  cwd: uniRoot,
  env: { ...process.env },
});

try {
  await waitPort("127.0.0.1", BRIDGE_PORT, 90000);
  console.log(`[restart-pc-dev-stack] bridge 已就绪 127.0.0.1:${BRIDGE_PORT}`);
} catch (e) {
  console.error(e);
  bridge.kill("SIGTERM");
  process.exit(1);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
console.log(`[restart-pc-dev-stack] 启动 faster-move-web :${PC_PORT}…`);
const pc = prefixSpawn("pc-5200", pnpm, ["run", "dev"], {
  cwd: pcRoot,
  shell: true,
  env: { ...process.env },
});

const pcWaitHosts = ["127.0.0.1", "10.10.10.177"];

try {
  const okHost = await waitPortFirstHosts(pcWaitHosts, PC_PORT, 180000);
  console.log(`[restart-pc-dev-stack] faster-move-web 已就绪 ${okHost}:${PC_PORT}`);
} catch (e) {
  console.error(e);
  pc.kill("SIGTERM");
  bridge.kill("SIGTERM");
  process.exit(1);
}

console.log("\n========================================");
console.log("[restart-pc-dev-stack] PC 栈已启动；手机 API 仍指向 http://<PC局域网IP>:5200/");
console.log("  若登录仍 502：确认本机 faster-move-web .env 中 VITE_PROXY_TARGET 指向 127.0.0.1:3000");
console.log("========================================\n");

function shutdown() {
  try {
    pc.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  try {
    bridge.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

pc.on("exit", (code) => {
  if (code && code !== 0) console.error(`[restart-pc-dev-stack] faster-move-web 退出码 ${code}`);
  try {
    bridge.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(code ?? 0);
});

bridge.on("exit", (code) => {
  if (code && code !== 0) console.error(`[restart-pc-dev-stack] bridge 退出码 ${code}`);
  try {
    pc.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(code ?? 0);
});
