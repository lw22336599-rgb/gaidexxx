/**
 * 固定启动顺序：先杀端口 → 再启动 uni H5（由 vite 绑定本机局域网 IPv4，见 vite.config.ts）
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { killDevPorts } from "./kill-dev-ports.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
killDevPorts();

const isWin = process.platform === "win32";
const cmd = isWin ? "pnpm.cmd" : "pnpm";
const child = spawn(cmd, ["run", "dev:h5"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env },
});

child.on("exit", (code) => process.exit(code ?? 0));
