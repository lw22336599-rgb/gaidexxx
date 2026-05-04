import http from "node:http";

const BASE = "http://127.0.0.1:3000";

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { method, headers: body ? { "Content-Type": "application/json" } : {} };
    const r = http.request(`${BASE}${path}`, opts, (res) => {
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, json: null, raw: buf });
        }
      });
    });
    r.on("error", reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

const sse = http.get(`${BASE}/seed/events`, (res) => {
  let buf = "";
  res.on("data", (c) => {
    buf += c;
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const evt = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      if (evt.trim()) console.log("[event]", evt.replace(/\n/g, " | "));
    }
  });
});

(async () => {
  await new Promise((r) => setTimeout(r, 400));

  console.log("\n--- 1) GET /seed/config (initial) ---");
  console.log((await req("GET", "/seed/config")).json);

  console.log("\n--- 2) POST /seed/clear ---");
  console.log((await req("POST", "/seed/clear")).json);
  await new Promise((r) => setTimeout(r, 300));

  console.log("\n--- 3) POST /seed/reset ---");
  console.log((await req("POST", "/seed/reset")).json);
  await new Promise((r) => setTimeout(r, 300));

  console.log("\n--- 4) POST /seed/mode {mode:real} ---");
  console.log((await req("POST", "/seed/mode", { mode: "real" })).json);
  await new Promise((r) => setTimeout(r, 200));

  console.log("\n--- 5) GET /seed/config after switch ---");
  console.log((await req("GET", "/seed/config")).json);

  console.log("\n--- 6) POST /seed/mode {mode:mock} (back) ---");
  console.log((await req("POST", "/seed/mode", { mode: "mock" })).json);
  await new Promise((r) => setTimeout(r, 200));

  sse.destroy();
  process.exit(0);
})();
