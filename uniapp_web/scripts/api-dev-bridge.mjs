/**
 * 开发用本地 HTTP 桥：监听 5265，将请求原样转发到 API_UPSTREAM（真实后端）。
 * 与 faster-move-web/docs/ServiceHttp.cs 中 Release 地址对齐；可在 .env.development 修改 API_UPSTREAM。
 */
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function readEnvFile(fileName) {
  const p = path.join(root, fileName);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const fileEnv = readEnvFile(".env.development");
const API_UPSTREAM = (
  process.env.API_UPSTREAM ||
  fileEnv.API_UPSTREAM ||
  "http://120.24.48.102:5265/"
).trim();
const LISTEN_PORT = Number(process.env.API_BRIDGE_PORT || fileEnv.API_BRIDGE_PORT || 5265);

const upstream = new URL(API_UPSTREAM.endsWith("/") ? API_UPSTREAM : `${API_UPSTREAM}/`);
const isHttps = upstream.protocol === "https:";
const defaultPort = isHttps ? 443 : 80;
const upstreamPort = upstream.port ? Number(upstream.port) : defaultPort;
const upstreamHost = upstream.hostname;

function buildHeaders(raw) {
  const out = { ...raw };
  out.host = `${upstreamHost}:${upstreamPort}`;
  return out;
}

const server = http.createServer((clientReq, clientRes) => {
  const targetPath = clientReq.url || "/";
  const opts = {
    protocol: upstream.protocol,
    hostname: upstreamHost,
    port: upstreamPort,
    method: clientReq.method,
    path: targetPath,
    headers: buildHeaders(clientReq.headers),
  };

  const lib = isHttps ? https : http;
  const p = lib.request(opts, (upRes) => {
    const h = { ...upRes.headers };
    clientRes.writeHead(upRes.statusCode || 502, h);
    upRes.pipe(clientRes);
  });

  p.on("error", (err) => {
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { "Content-Type": "application/json; charset=UTF-8" });
    }
    clientRes.end(
      JSON.stringify({
        code: 502,
        msg: `[api-dev-bridge] 上游不可达: ${upstreamHost}:${upstreamPort} — ${err.message}`,
        data: null,
      })
    );
  });

  clientReq.pipe(p);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[api-dev-bridge] 端口 ${LISTEN_PORT} 已被占用。请先结束 mock-backend 或其它进程，或设置 API_BRIDGE_PORT=5266 并同步修改 .env.development 的 VITE_PROXY_TARGET。`
    );
  } else {
    console.error("[api-dev-bridge]", err);
  }
  process.exit(1);
});

server.listen(LISTEN_PORT, "127.0.0.1", () => {
  console.log(
    `[api-dev-bridge] http://127.0.0.1:${LISTEN_PORT}  ->  ${upstream.protocol}//${upstreamHost}:${upstreamPort}`
  );
});
