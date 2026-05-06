/**
 * 微信小程序 dev：打印 API 基址与产物路径；首次编译产出后尝试用微信开发者工具 CLI 打开项目。
 * 1）安装微信开发者工具并在「设置 → 安全设置」开启「服务端口」；
 * 2）若仍未自动打开，设置环境变量 WECHAT_DEVTOOLS_CLI 为 cli.bat 的绝对路径。
 */
import { spawn, execFile, execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mpOut = path.join(root, "dist", "dev", "mp-weixin");
const API_BASE = "http://10.10.10.177:5200";

function printBanner() {
  console.log("\n========================================");
  console.log("[MP-WEIXIN] 业务接口 baseURL（uni.request）:", API_BASE);
  console.log("[MP-WEIXIN] 本地 devServer 端口: （不适用）mp-weixin 为编译输出模式，无 H5 式预览 URL");
  console.log("[MP-WEIXIN] 热更新: 保存源码后自动重新编译；开发者工具侧请开启自动刷新或使用预览重新加载");
  console.log("[MP-WEIXIN] 微信开发者工具「导入/打开」项目目录:");
  console.log(" ", mpOut);
  console.log("========================================\n");
}

function resolveUniJs() {
  const requireFromRoot = createRequire(path.join(root, "package.json"));
  return requireFromRoot.resolve("@dcloudio/vite-plugin-uni/bin/uni.js");
}

function readWechatInstallPathFromRegistry() {
  if (process.platform !== "win32") return null;
  const keys = [
    "HKLM\\SOFTWARE\\WOW6432Node\\Tencent\\微信web开发者工具",
    "HKLM\\SOFTWARE\\Tencent\\微信web开发者工具",
    "HKCU\\SOFTWARE\\Tencent\\微信web开发者工具",
  ];
  for (const key of keys) {
    try {
      const out = execSync(`reg query "${key}" /v InstallPath`, {
        encoding: "utf8",
        windowsHide: true,
      });
      const m = out.match(/REG_SZ\s+(.+)/);
      if (m) {
        const dir = m[1].trim();
        const cli = path.join(dir, "cli.bat");
        if (fs.existsSync(cli)) return cli;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function findWechatCli() {
  const envPath = process.env.WECHAT_DEVTOOLS_CLI;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const regCli = readWechatInstallPathFromRegistry();
  if (regCli) return regCli;
  const candidates = [
    path.join(process.env["ProgramFiles(x86)"] || "", "Tencent", "微信web开发者工具", "cli.bat"),
    path.join(process.env.ProgramFiles || "", "Tencent", "微信web开发者工具", "cli.bat"),
    path.join(process.env.ProgramFiles || "", "Tencent", "微信开发者工具", "cli.bat"),
    path.join(process.env["ProgramFiles(x86)"] || "", "Tencent", "微信开发者工具", "cli.bat"),
    path.join(process.env.LOCALAPPDATA || "", "微信开发者工具", "cli.bat"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "wechatdevtools", "cli.bat"),
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function openWechatProjectOnce() {
  const marker = path.join(mpOut, "project.config.json");
  if (!fs.existsSync(marker)) return false;
  const cli = findWechatCli();
  if (!cli) {
    console.warn(
      "[MP-WEIXIN] 未检测到微信开发者工具 cli.bat，请手动打开工具并导入上述目录；或设置环境变量 WECHAT_DEVTOOLS_CLI",
    );
    return true;
  }
  console.log("[MP-WEIXIN] 使用 CLI:", cli);
  execFile(
    cli,
    ["open", "--project", path.resolve(mpOut)],
    { windowsHide: true },
    (err) => {
      if (err) {
        console.warn("[MP-WEIXIN] CLI open 失败（请确认工具内已开启「服务端口」）:", err.message);
      } else {
        console.log("[MP-WEIXIN] 已向微信开发者工具发送 open --project");
      }
    },
  );
  return true;
}

printBanner();

const uniJs = resolveUniJs();
const child = spawn(process.execPath, [uniJs, "-p", "mp-weixin"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, VITE_UNI_FORCE_API_BASE: API_BASE },
});

let opened = false;
const poll = setInterval(() => {
  if (opened) return;
  if (openWechatProjectOnce()) {
    opened = true;
    clearInterval(poll);
  }
}, 800);

setTimeout(() => {
  if (!opened) clearInterval(poll);
}, 120000);

child.on("exit", (code) => {
  clearInterval(poll);
  process.exit(code ?? 0);
});
