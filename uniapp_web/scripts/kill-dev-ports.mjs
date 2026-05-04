/**
 * 释放本项目常用端口（Vite / api-dev-bridge），避免端口漂移导致连错服务。
 * Windows：解析 netstat LISTENING 并 taskkill；其他：fuser/lsof。
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);

/** 与 .env.development 中 API_BRIDGE_PORT、VITE_DEV_PORT 对齐 */
const PORTS_TO_FREE = [3000, 5200, 5265, 5266, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];

function killWindowsPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const t = line.trim();
      if (!t.includes("LISTENING")) continue;
      const parts = t.split(/\s+/).filter(Boolean);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`[kill-dev-ports] 已结束占用 :${port} 的 PID=${pid}`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* 无监听 */
  }
}

function killUnixPort(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
  } catch {
    try {
      const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" });
      for (const pid of out.split(/\r?\n/).filter(Boolean)) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`[kill-dev-ports] 已结束占用 :${port} PID=${pid}`);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  }
}

/** 仅释放指定端口（例如只动 3000/5200，保留 5173 H5） */
export function killPorts(ports) {
  const list = Array.isArray(ports) ? ports : [];
  console.log("[kill-dev-ports] 清理端口:", list.join(", "));
  for (const port of list) {
    if (process.platform === "win32") killWindowsPort(port);
    else killUnixPort(port);
  }
  console.log("[kill-dev-ports] 完成\n");
}

export function killDevPorts() {
  killPorts(PORTS_TO_FREE);
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (invoked) killDevPorts();
