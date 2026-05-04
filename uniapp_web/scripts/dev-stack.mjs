/**
 * 先启动 api-dev-bridge（端口见环境变量 API_BRIDGE_PORT，默认 5265），再启动 uni H5；Ctrl+C 结束子进程。
 */
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const bridgePath = path.join(root, "scripts", "api-dev-bridge.mjs");
const PORT = Number(process.env.API_BRIDGE_PORT || 5265);

function waitPort(port, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tryOnce = () => {
      const s = createConnection({ port, host: "127.0.0.1" }, () => {
        s.destroy();
        resolve();
      });
      s.on("error", () => {
        s.destroy();
        if (Date.now() - t0 > timeoutMs) reject(new Error(`等待 127.0.0.1:${port} 超时`));
        else setTimeout(tryOnce, 250);
      });
    };
    tryOnce();
  });
}

const bridge = spawn(process.execPath, [bridgePath], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env },
});

bridge.on("exit", (code) => {
  if (code && code !== 0) process.exit(code);
});

try {
  await waitPort(PORT);
} catch (e) {
  console.error(e);
  bridge.kill("SIGTERM");
  process.exit(1);
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const vite = spawn(npmCmd, ["run", "dev:h5"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

function shutdown() {
  vite.kill("SIGTERM");
  bridge.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
vite.on("exit", (code) => {
  bridge.kill("SIGTERM");
  process.exit(code ?? 0);
});
