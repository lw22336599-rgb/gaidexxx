/**
 * 对齐 faster-move-web `src/utils/request.ts` 的契约：baseURL、Authorization、code/msg、401 清会话
 * 实现为 uni.request（H5/小程序通用）
 *
 * H5：所有业务请求直连本常量指向的 PC 端 Vite（再由其代理到 bridge/上游），与 utils/request 拦截器一致。
 */
import { invalidateSession } from "@/auth/session";
import { netConfig } from "@/config/http";
import type { ApiEnvelope } from "@/types/http";
import { resolvePcViteOrigin } from "@/utils/h5DevOrigins";
import { getToken } from "@/utils/token";

export interface RequestOptions extends UniApp.RequestOptions {
  /** 为 true 时不自动附加 Authorization */
  skipAuth?: boolean;
  /**
   * 失败或网关错误时的额外重试次数（默认 1 → 最多共 2 次请求），缓解弱网/桥接慢
   */
  retry?: number;
}

function resolveBaseUrl(): string {
  return resolvePcViteOrigin();
}

function normalizeUrl(base: string, url: string): string {
  if (!url) return base;
  if (/^https?:\/\//i.test(url)) return url;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = url.startsWith("/") ? url : `/${url}`;
  if (!b) return p;
  return `${b}${p}`;
}

const codeVerificationArray: readonly unknown[] = Array.isArray(netConfig.successCode)
  ? netConfig.successCode
  : [netConfig.successCode];

function isBusinessSuccess(body: Record<string, unknown>, httpStatus: number): boolean {
  const statusKey = netConfig.statusName as keyof typeof body;
  const raw = body[statusKey];
  const code = raw !== undefined && raw !== null ? raw : httpStatus;
  return codeVerificationArray.includes(code as never);
}

function toast(msg: string) {
  uni.showToast({ title: msg.slice(0, 80), icon: "none", duration: 2500 });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetriableError(err: unknown, httpStatus?: number): boolean {
  if (httpStatus === 502 || httpStatus === 503 || httpStatus === 504) return true;
  if (!err || typeof err !== "object") return false;
  if ("errMsg" in err) {
    const m = String((err as UniApp.GeneralCallbackResult).errMsg || "").toLowerCase();
    return m.includes("timeout") || m.includes("time out") || m.includes("fail") || m.includes("abort");
  }
  if (err instanceof Error) {
    const m = err.message || "";
    return /HTTP_502|HTTP_503|HTTP_504|timeout/i.test(m);
  }
  return false;
}

/** 单次请求（不重试）；finalAttempt 为 false 时 502/网络失败不弹 Toast，交给外层重试 */
function requestOnce<T>(
  options: RequestOptions,
  finalAttempt: boolean,
): Promise<ApiEnvelope<T>> {
  const { skipAuth, retry: _r, ...uniOpts } = options;
  const baseURL = resolveBaseUrl();
  const header: Record<string, string> = {
    "Content-Type": netConfig.contentType as string,
    ...((uniOpts.header || {}) as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) header.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...uniOpts,
      url: normalizeUrl(baseURL, uniOpts.url || ""),
      header,
      timeout: uniOpts.timeout ?? (netConfig.timeout as number),
      success: (res) => {
        const httpStatus = res.statusCode || 0;
        if (httpStatus === 401) {
          invalidateSession();
          toast("登录已失效，请重新登录");
          setTimeout(() => {
            uni.reLaunch({ url: "/pages/login/login" });
          }, 400);
          reject(new Error("401"));
          return;
        }

        if (httpStatus >= 500) {
          if (!finalAttempt && isRetriableError(null, httpStatus)) {
            reject(new Error(`HTTP_${httpStatus}`));
            return;
          }
          const hint502 =
            httpStatus === 502 || httpStatus === 504
              ? "（常见：api-dev-bridge 未监听 3000，或 PC Vite 代理目标不可达）"
              : "";
          toast(
            `服务端 HTTP ${httpStatus}${hint502}。请确认 5200 已启动且已在 PC 上运行 bridge；可执行 pnpm run restart:pc-stack`,
          );
          reject(new Error(`HTTP_${httpStatus}`));
          return;
        }

        const rawData = res.data;
        if (typeof rawData === "string" && /^\s*</.test(rawData)) {
          toast(`接口返回 HTML（HTTP ${httpStatus}），请确认 PC 端 faster-move-web 已在 ${resolveBaseUrl()} 启动`);
          reject(new Error("HTML_RESPONSE"));
          return;
        }

        const body = (rawData || {}) as ApiEnvelope<T> & Record<string, unknown>;
        const statusKey = netConfig.statusName as keyof typeof body;
        const bizCode = body[statusKey];
        if (bizCode === 401) {
          invalidateSession();
          toast(String(body[netConfig.messageName as keyof typeof body] || "未授权"));
          setTimeout(() => {
            uni.reLaunch({ url: "/pages/login/login" });
          }, 400);
          reject(new Error("401"));
          return;
        }

        if (isBusinessSuccess(body as Record<string, unknown>, httpStatus)) {
          resolve(body);
          return;
        }

        const msg =
          (body[netConfig.messageName as keyof typeof body] as string) ||
          `请求失败(${String(bizCode ?? httpStatus)})`;
        toast(msg);
        reject(new Error(msg));
      },
      fail: (err) => {
        if (!finalAttempt && isRetriableError(err)) {
          reject(err);
          return;
        }
        toast(err.errMsg || "网络异常");
        reject(err);
      },
    });
  });
}

export async function request<T = unknown>(options: RequestOptions): Promise<ApiEnvelope<T>> {
  const extra = Math.max(0, options.retry ?? 1);
  const maxAttempts = 1 + extra;
  let lastErr: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    const final = i >= maxAttempts - 1;
    try {
      return await requestOnce<T>(options, final);
    } catch (e) {
      lastErr = e;
      if (!final && isRetriableError(e)) {
        await sleep(380 + i * 220);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export function get<T = unknown>(
  url: string,
  data?: UniApp.RequestOptions["data"],
  extra?: Partial<RequestOptions>,
) {
  return request<T>({ url, method: "GET", data, ...extra });
}

export function post<T = unknown>(
  url: string,
  data?: UniApp.RequestOptions["data"],
  extra?: Partial<RequestOptions>,
) {
  return request<T>({ url, method: "POST", data, ...extra });
}
