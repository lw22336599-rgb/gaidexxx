/**
 * Mock 登录（仅 VITE_MOCK_AUTH=true 时启用，用于无后端 / 超时场景）。
 * 与 PC 对齐的 token 存储键仍为 shop-vite-token（见 setting.config）。
 */

/** 默认测试手机号（任意密码即可登录，不请求真实接口） */
export const MOCK_DEFAULT_PHONE =
  (import.meta.env.VITE_MOCK_DEFAULT_PHONE as string | undefined)?.trim() || "18090890691";

/** H5/各端共用的 Mock 会话令牌（须与 URL 参数 mock_token 一致方可免登） */
export const MOCK_SESSION_TOKEN =
  (import.meta.env.VITE_MOCK_SESSION_TOKEN as string | undefined)?.trim() ||
  "uni-mock-shared-session-token";

export function isMockAuthEnabled(): boolean {
  return String(import.meta.env.VITE_MOCK_AUTH || "").toLowerCase() === "true";
}

export function isAllowedMockLoginPayload(data: Record<string, unknown>): boolean {
  const phone = String(data.phone ?? "").trim();
  return phone === MOCK_DEFAULT_PHONE;
}

export function mockLoginSuccessEnvelope() {
  return {
    code: 200,
    data: { ResultType: 0, Token: MOCK_SESSION_TOKEN },
    msg: "mock-ok",
  } as const;
}

export function mockGetUserInfoEnvelope() {
  return {
    code: 200,
    data: {
      admin: {
        user_name: "默认测试账号",
        avatar: "",
        role: ["演示角色", "ADMIN"] as unknown[],
        id: 10001,
        phone: "18000000000",
        notes: "Mock 账号 · 无后端时使用",
        balance: 0,
      },
      count_shop_type: [
        { Title: "美团", ShopCount: 8 },
        { Title: "饿了么", ShopCount: 5 },
        { Title: "京东", ShopCount: 2 },
      ],
    },
    msg: "mock-ok",
  } as const;
}

export function isMockSessionToken(token: string): boolean {
  return !!token && token === MOCK_SESSION_TOKEN;
}
