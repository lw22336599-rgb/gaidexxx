/**
 * 本地最小 mock（假数据）。要连真实后端请用：npm run dev:h5:live（见 api-dev-bridge.mjs）
 * 运行：node scripts/mock-backend-5265.mjs
 */
import http from "node:http";

const PORT = Number(process.env.MOCK_PORT || 5265);

const server = http.createServer((req, res) => {
  const url = req.url || "";
  let body = "";
  req.on("data", (c) => {
    body += c;
  });
  req.on("end", () => {
    res.setHeader("Content-Type", "application/json; charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.statusCode = 204;
      res.end();
      return;
    }
    if (url.startsWith("/admin/agencylogin") && req.method === "POST") {
      res.end(
        JSON.stringify({
          code: 200,
          data: { ResultType: 0, Token: "mock-dev-token" },
          msg: "ok",
        })
      );
      return;
    }
    if (url.startsWith("/admin/getagencyinfo") && req.method === "GET") {
      res.end(
        JSON.stringify({
          code: 200,
          data: {
            admin: { user_name: "Mock用户", avatar: "", role: [] },
          },
          msg: "ok",
        })
      );
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ code: 404, msg: "not found", data: null }));
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-backend] http://127.0.0.1:${PORT}`);
});
