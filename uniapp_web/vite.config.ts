import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const raw = (env.VITE_PROXY_TARGET || "http://127.0.0.1:5265").trim();
  const proxyTarget = raw.endsWith("/") ? raw : `${raw}/`;

  return {
    plugins: [uni()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/proxy": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/proxy/, "") || "/",
        },
      },
    },
  };
});
