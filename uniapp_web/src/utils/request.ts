/**
 * 对齐 faster-move-web `src/utils/request.ts` 的契约：baseURL、Authorization、code/msg、401 清会话
 * 实现为 uni.request（H5/小程序通用）
 */
import { invalidateSession } from "@/auth/session";
import { netConfig } from "@/config/http";
import type { ApiEnvelope } from "@/types/http";
import { getToken } from "@/utils/token";

export interface RequestOptions extends UniApp.RequestOptions {
  /** 为 true 时不自动附加 Authorization */
  skipAuth?: boolean;
}

function resolveBaseUrl(): string {
  const u = (import.meta.env.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_API || "") as string;
  return u;
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

export function request<T = unknown>(options: RequestOptions): Promise<ApiEnvelope<T>> {
  const { skipAuth, ...uniOpts } = options;
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
          const hint502 =
            httpStatus === 502 || httpStatus === 504
              ? "（常见：代理目标未启动或端口错误）"
              : "";
          toast(
            `服务端 HTTP ${httpStatus}${hint502}。请确认后端可用，或修改 .env.development 的 VITE_PROXY_TARGET`
          );
          reject(new Error(`HTTP_${httpStatus}`));
          return;
        }

        const rawData = res.data;
        if (typeof rawData === "string" && /^\s*</.test(rawData)) {
          toast(`接口返回 HTML（HTTP ${httpStatus}），多为域名停放页或网关错误，请更换 VITE_PROXY_TARGET`);
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
        toast(err.errMsg || "网络异常");
        reject(err);
      },
    });
  });
}

export function get<T = unknown>(url: string, data?: UniApp.RequestOptions["data"]) {
  return request<T>({ url, method: "GET", data });
}

export function post<T = unknown>(url: string, data?: UniApp.RequestOptions["data"]) {
  return request<T>({ url, method: "POST", data });
}
