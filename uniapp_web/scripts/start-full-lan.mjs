/**
 * 局域网一键联调：先停止占用端口 → api-dev-bridge（默认 10.10.10.177:3000）
 * → faster-move-web（10.10.10.177:5200）→ uni H5（10.10.10.177:5173）。
 * 配置以 uniapp_web/.env.development 为准；服务绑定 0.0.0.0 时，就绪检测使用 127.0.0.1。
 */
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { killDevPorts } from "./kill-dev-ports.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uniRoot = path.join(__dirname, "..");
const repoRoot = path.join(uniRoot, "..");
const pcRoot = path.join(repoRoot, "faster-move-web");

function readEnvPort(fileName, key, fallback) {
  try {
    const p = path.join(uniRoot, fileName);
    if (!fs.existsSync(p)) return fallback;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (k !== key) continue;
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

function readEnvString(fileName, key, fallback) {
  try {
    const p = path.join(uniRoot, fileName);
    if (!fs.existsSync(p)) return fallback;
    const text = fs.readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      if (k !== key) continue;
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      return v.trim() || fallback;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

const BRIDGE_PORT = readEnvPort(".env.development", "API_BRIDGE_PORT", 3000);
const H5_PORT = readEnvPort(".env.development", "VITE_DEV_PORT", 5173);
const PC_PORT = 5200;
const BRIDGE_BIND = readEnvString(".env.development", "API_BRIDGE_BIND", "127.0.0.1");
const waitHost =
  BRIDGE_BIND === "0.0.0.0" || BRIDGE_BIND === "::" || BRIDGE_BIND === "" ? "127.0.0.1" : BRIDGE_BIND;

function primaryLanIpv4() {
  const ifs = os.networkInterfaces();
  const cands = [];
  for (const name of Object.keys(ifs)) {
    for (const n of ifs[name] || []) {
      if (n.internal) continue;
      if (n.family !== "IPv4" && n.family !== 4) continue;
      const a = n.address;
      if (!a || a.startsWith("169.254.")) continue;
      cands.push(a);
    }
  }
  cands.sort((a, b) => {
    const ra = a.startsWith("192.168.") ? 0 : a.startsWith("10.") ? 1 : 2;
    const rb = b.startsWith("192.168.") ? 0 : b.startsWith("10.") ? 1 : 2;
    return ra - rb || a.localeCompare(b);
  });
  return cands[0] || "127.0.0.1";
}

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

function prefixSpawn(tag, command, args, opts) {
  const child = spawn(command, args, { ...opts, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout?.on("data", (b) => process.stdout.write(`[${tag}] ${b}`));
  child.stderr?.on("data", (b) => process.stderr.write(`[${tag}] ${b}`));
  return child;
}

if (!fs.existsSync(pcRoot)) {
  console.error(`[start-full-lan] 未找到 PC 工程目录: ${pcRoot}`);
  process.exit(1);
}

console.log("[start-full-lan] 停止占用端口的本地开发进程…");
killDevPorts();
await new Promise((r) => setTimeout(r, 1500));

const bridgePath = path.join(uniRoot, "scripts", "api-dev-bridge.mjs");
console.log(`[start-full-lan] 启动 api-dev-bridge（监听 ${BRIDGE_BIND}:${BRIDGE_PORT}，探测 ${waitHost}:${BRIDGE_PORT}）…`);
const bridge = prefixSpawn("bridge", process.execPath, [bridgePath], {
  cwd: uniRoot,
  env: { ...process.env },
});

try {
  await waitPort(waitHost, BRIDGE_PORT, 90000);
  console.log(`[start-full-lan] bridge 已就绪（${waitHost}:${BRIDGE_PORT} 可连）`);
} catch (e) {
  console.error(e);
  bridge.kill("SIGTERM");
  process.exit(1);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
console.log(`[start-full-lan] 启动 faster-move-web（探测 ${waitHost}:${PC_PORT}）…`);
const pc = prefixSpawn("pc-5200", pnpm, ["run", "dev"], {
  cwd: pcRoot,
  shell: true,
  env: { ...process.env },
});

try {
  await waitPort(waitHost, PC_PORT, 180000);
  console.log(`[start-full-lan] PC Vite 已就绪（${waitHost}:${PC_PORT} 可连）`);
} catch (e) {
  console.error(e);
  pc.kill("SIGTERM");
  bridge.kill("SIGTERM");
  process.exit(1);
}

console.log(`[start-full-lan] 启动 uni H5（端口 ${H5_PORT}，绑定见 VITE_DEV_HOST）…`);
const uni = prefixSpawn("uni-h5", pnpm, ["run", "dev:h5"], {
  cwd: uniRoot,
  shell: true,
  env: { ...process.env },
});

const lanHint = primaryLanIpv4();
console.log("\n========================================");
console.log("[start-full-lan] 手机/电脑可用局域网地址（示例，与 H5 控制台一致即可）：");
console.log(`  http://${lanHint}:${H5_PORT}/#/pages/index/index`);
console.log("========================================\n");

function shutdown() {
  try {
    uni.kill("SIGTERM");
  } catch {
    /* ignore */
  }
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

uni.on("exit", (code) => {
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
  process.exit(code ?? 0);
});

pc.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`[start-full-lan] faster-move-web 退出码 ${code}`);
    try {
      uni.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    try {
      bridge.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    process.exit(code);
  }
});

bridge.on("exit", (code) => {
  if (code && code !== 0) {
    console.error(`[start-full-lan] bridge 退出码 ${code}`);
    try {
      uni.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    try {
      pc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    process.exit(code);
  }
});
