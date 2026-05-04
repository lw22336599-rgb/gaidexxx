/**
 * 冒烟 3 轮：校验局域网 bridge `/seed/stores` 是否在 3s 内返回列表（门店数据结构）。
 * H5 壳层用根路径探测在线。推送 Tab 需真机 WebView 内开，此处以 API 列表为准对齐「门店列表」可用性。
 *
 * 用法：node scripts/smoke-h5-store-push.mjs [baseUrl]
 * 例：node scripts/smoke-h5-store-push.mjs http://127.0.0.1:5173
 * 环境：SMOKE_API=http://10.10.10.177:3000（与当前 .env.development 一致）
 */
import http from "node:http";

const base = (process.argv[2] || "http://127.0.0.1:5173").replace(/\/$/, "");
const apiBase = (process.env.SMOKE_API || "http://10.10.10.177:3000").replace(/\/$/, "");

function fetchText(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.pathname + u.search,
        method: "GET",
        timeout: timeoutMs,
        headers: { Accept: "application/json,text/html,*/*", "User-Agent": "smoke-h5-store-push" },
      },
      (res) => {
        let buf = "";
        res.setEncoding("utf8");
        res.on("data", (c) => {
          buf += c;
        });
        res.on("end", () => resolve(buf));
      }
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function runRound(i) {
  const tShell = Date.now();
  const shell = await fetchText(`${base}/`, 5000).catch(() => "");
  const shellMs = Date.now() - tShell;

  const tApi = Date.now();
  let listOk = false;
  let listApiMs = 0;
  try {
    const body = await fetchText(`${apiBase}/seed/stores`, 3000);
    listApiMs = Date.now() - tApi;
    const j = JSON.parse(body);
    listOk = Boolean(j && j.code === 200 && Array.isArray(j.data));
  } catch {
    listApiMs = Date.now() - tApi;
    listOk = false;
  }

  return {
    round: i,
    viteShellOk: shell.length > 80,
    viteShellMs: shellMs,
    listApiOk: listOk,
    listApiMs,
  };
}

async function main() {
  console.log("SMOKE base=%s api=%s", base, apiBase);
  const results = [];
  for (let i = 1; i <= 3; i++) {
    results.push(await runRound(i));
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(JSON.stringify(results, null, 2));
  const allListOk = results.every((r) => r.listApiOk && r.listApiMs <= 3000);
  if (!allListOk) {
    console.error("SMOKE_FAIL: %s/seed/stores 未在 3s 内返回 code=200 与 data 数组", apiBase);
    process.exit(1);
  }
  console.log("SMOKE_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
