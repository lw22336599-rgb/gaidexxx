import http from "node:http";

const url = process.env.URL || "http://127.0.0.1:3000/seed/events";
console.log(`[sse-test] connecting ${url}`);

const req = http.get(url, (res) => {
  console.log("[sse-test] status:", res.statusCode);
  res.setEncoding("utf8");
  let buf = "";
  res.on("data", (chunk) => {
    buf += chunk;
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const evt = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      console.log("[event]", evt.replace(/\n/g, " | "));
    }
  });
  res.on("end", () => console.log("[sse-test] closed"));
});

req.on("error", (e) => console.error("[sse-test] error:", e.message));

setTimeout(() => process.exit(0), 4000);
