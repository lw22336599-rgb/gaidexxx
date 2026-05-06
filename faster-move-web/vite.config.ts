import autoprefixer from 'autoprefixer'
import dayjs from 'dayjs'
import { resolve } from 'node:path'
import type { ConfigEnv, Plugin, UserConfig } from 'vite'
import { defineConfig, loadEnv } from 'vite'

import {
  assetsDir,
  base,
  chunkSizeWarningLimit,
  cssCodeSplit,
  exclude,
  https,
  include,
  minify,
  open,
  outDir,
  outputHash,
  port,
  reportCompressedSize,
} from '/@/config'
import { createVitePlugin, createWatch } from '/@vab/build'

const lastBuildTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

/** PC dev 代理默认走本机 bridge（避免写死局域网 IP 导致本机无该网卡时 5200 起不来或代理不可达） */
const DEFAULT_BRIDGE = 'http://127.0.0.1:3000/'

/** PC dev：`/` 通配 → bridge；放行 Vite 模块、源码与静态 */
function pcBridgeRootBypass(req: {
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const raw = req.url || "";
  const pathOnly = raw.split("?")[0] || "";
  if (
    raw.startsWith("/@vite") ||
    raw.startsWith("/@fs") ||
    raw.startsWith("/@id") ||
    raw.startsWith("/__")
  ) {
    return raw;
  }
  if (
    raw.startsWith("/node_modules") ||
    raw.startsWith("/@/") ||
    raw.startsWith("/src/") ||
    raw.startsWith("/library/") ||
    raw.startsWith("/public/")
  ) {
    return raw;
  }
  if (
    /\.(vue|tsx?|jsx?|mjs|js|ts|css|scss|sass|less|json|svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|map|wasm)(\?|$)/i.test(
      pathOnly,
    )
  ) {
    return raw;
  }
  if (req.method === "GET" && (req.headers.accept || "").includes("text/html")) {
    return raw;
  }
  // Vite bypass：仅 `string` 改写后走本地中间件；`false` 会令 dev server 直接 404，从不转发到 target
  return undefined;
}

/** 启动后在终端打印监听地址，便于确认 0.0.0.0:5200 */
function createPcDevBindLogPlugin(host: string, listenPort: number): Plugin {
  return {
    name: 'pc-dev-bind-log',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address()
        console.log('\n========== [faster-move-web] Vite dev ==========')
        console.log('[faster-move-web] server.host (VITE_PC_DEV_BIND):', host)
        console.log('[faster-move-web] listen():', addr)
        console.log('[faster-move-web] port:', listenPort)
        if (host === '0.0.0.0') {
          console.log('[faster-move-web] OK: 已绑定 0.0.0.0，可从 127.0.0.1 与本机局域网 IP 访问')
        }
        console.log('==================================================\n')
      })
    },
  }
}

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  process.env['VITE_APP_UPDATE_TIME'] = lastBuildTime
  process.env['VITE_USER_NODE_ENV'] = mode
  const root = process.cwd()
  const env = loadEnv(mode, root)
  createWatch(env)

  const bridge = (env.VITE_PROXY_TARGET || DEFAULT_BRIDGE).trim()
  const bridgeTarget = bridge.endsWith('/') ? bridge : `${bridge}/`
  const bridgeOrigin = bridgeTarget.replace(/\/$/, '')
  const pcDevBind = (env.VITE_PC_DEV_BIND || '0.0.0.0').trim()

  return {
    base,
    root,
    server: {
      open,
      port,
      /** 手机 H5（5173 等）跨源打 5200 时，放宽 dev CORS（代理链仍由 bridge 回写 ACAO） */
      cors: true,
      hmr: {
        overlay: true,
      },
      host: pcDevBind,
      proxy: {
        // 具体 API 前缀优先匹配，避免仅靠 `/` + bypass 时序问题；无 bypass，一律透传 bridge
        '/admin': { target: bridgeOrigin, changeOrigin: true },
        '/homedata': { target: bridgeOrigin, changeOrigin: true },
        '/seed': { target: bridgeOrigin, changeOrigin: true },
        '/userManagement': { target: bridgeOrigin, changeOrigin: true },
        '/system': { target: bridgeOrigin, changeOrigin: true },
        '/api': { target: bridgeOrigin, changeOrigin: true },
        '/': {
          target: bridgeOrigin,
          changeOrigin: true,
          bypass: pcBridgeRootBypass,
        },
      },
      warmup: {
        clientFiles: ['./index.html', './library/{components,layouts}/*', './src/{views,plugins}/*'],
      },
      https,
      fs: {
        //cachedChecks: true,
      },
    },
    resolve: {
      alias: {
        '~/': `${resolve(__dirname, '.')}/`,
        '@': `/${resolve(__dirname, 'src')}`,
        '/@/': `/${resolve(__dirname, 'src')}/`,
        '/@vab/': `/${resolve(__dirname, 'library')}/`,
      },
    },
    optimizeDeps: {
      include,
      exclude,
    },
    build: {
      assetsDir,
      chunkSizeWarningLimit,
      cssCodeSplit,
      outDir,
      reportCompressedSize,
      rollupOptions: {
        onwarn: () => {
          return
        },
        output: {
          chunkFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          entryFileNames: outputHash ? 'static/js/[name]-[hash].js' : 'static/js/[name].js',
          assetFileNames: outputHash ? 'static/[ext]/[name]-[hash].[ext]' : 'static/[ext]/[name].[ext]',
          manualChunks: {
            'vsv-element-plus': ['element-plus'],
            'vsv-nprogress': ['nprogress'],
            'vsv-icon': ['vsv-icon'],
            'vsv-echarts': ['echarts'],
          },
        },
      },
      minify,
      sourcemap: false,
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({ grid: true }) as any,
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule: { name: string; remove: () => void }) => {
                if (atRule.name === 'charset') atRule.remove()
              },
            },
          },
        ],
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 修复警告: Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
          // sassOptions: { outputStyle: 'expanded' },
          // additionalData(content: string, loaderContext: string) {
          //   return ['variables.scss'].includes(basename(loaderContext))
          //     ? content
          //     : `@use "~/library/styles/variables.scss" as *;${content}`
          // },
        },
      },
      devSourcemap: true,
    },
    plugins: [
      createPcDevBindLogPlugin(pcDevBind, Number(port)),
      ...(createVitePlugin(env) || []),
    ],
    define: {
      // 如果您必须使用华为组件库且打包报错，请放开该行，放开注释后会将您的环境变量暴露给华为组件库
      // 'process.env': { ...process.env },
    },
  }
})
