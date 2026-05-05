import { isMockAuthEnabled, MOCK_SESSION_TOKEN } from "@/config/mockAuth";
import { useUserStore } from "@/stores/user";
import { getToken } from "@/utils/token";

export const LOGIN_STATE_STORAGE_KEY = "sharedLoginState";

function persistUserInfoPayloadFromShared(raw: unknown): void {
  if (raw == null) return;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return;
    try {
      JSON.parse(t);
      uni.setStorageSync("userInfo", t);
    } catch {
      /* ignore invalid */
    }
    return;
  }
  if (typeof raw === "object") {
    uni.setStorageSync("userInfo", JSON.stringify(raw));
  }
}

export function writeSharedLoginState(payload: { token?: string; userInfo?: unknown }) {
  try {
    let userInfoSerialized: string | null = null;
    const u = payload.userInfo;
    if (u != null) {
      userInfoSerialized = typeof u === "string" ? u : JSON.stringify(u);
    }
    uni.setStorageSync(LOGIN_STATE_STORAGE_KEY, JSON.stringify({
      token: payload.token || "",
      userInfo: userInfoSerialized,
      ts: Date.now(),
    }));
  } catch {
    /* ignore */
  }
}

export function readSharedLoginState(): { token?: string; userInfo?: unknown } | null {
  try {
    const raw = uni.getStorageSync(LOGIN_STATE_STORAGE_KEY);
    if (!raw || typeof raw !== "string") return null;
    const data = JSON.parse(raw) as { token?: string; userInfo?: unknown };
    return data;
  } catch {
    return null;
  }
}

/** 从 sharedLoginState 恢复 token/userInfo，避免 H5 切页后偶发丢登录态 */
export function hydrateLoginStateFromShared(): boolean {
  const shared = readSharedLoginState();
  const store = useUserStore();
  let restored = false;
  if (shared?.token) {
    const current = getToken();
    if (!current) {
      store.setToken(String(shared.token));
      restored = true;
    }
    try {
      const hasLocal = !!uni.getStorageSync("userInfo");
      if (shared.userInfo != null && !hasLocal) {
        persistUserInfoPayloadFromShared(shared.userInfo);
      }
    } catch {
      /* ignore */
    }
  }
  if (getToken()) {
    store.hydrateProfileFromStorage();
  }
  return restored;
}

export function clearSharedLoginState() {
  try {
    uni.removeStorageSync(LOGIN_STATE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** 写入与接口 Mock 一致的本地登录态（shop-vite-token + userInfo + store） */
export function applyMockSharedLoginState() {
  if (!isMockAuthEnabled()) return;
  const store = useUserStore();
  store.setToken(MOCK_SESSION_TOKEN);
  store.setUsername("默认测试账号");
  store.setAvatar("");
  const userInfo = {
    admin: { user_name: "默认测试账号", avatar: "", role: [], id: 0 },
  };
  uni.setStorageSync("userInfo", JSON.stringify(userInfo));
  writeSharedLoginState({ token: MOCK_SESSION_TOKEN, userInfo });
}

/**
 * 首页 / 登录页 onLoad 解析：
 * - mockBypass=1：本机开发一键免登（仅 Mock 开启时有效）
 * - mock_token= 与 MOCK_SESSION_TOKEN 相同：便于手机与电脑通过同一链接同步登录态
 */
export function applyMockSessionFromQuery(opts: Record<string, string | undefined> | undefined) {
  if (!isMockAuthEnabled() || !opts) return;
  const bypass = opts.mockBypass === "1" || opts.mockBypass === "true";
  const tokenOk = opts.mock_token === MOCK_SESSION_TOKEN;
  if (bypass || tokenOk) {
    applyMockSharedLoginState();
    if (tokenOk && !bypass) {
      uni.showToast({ title: "已同步 Mock 登录态", icon: "none", duration: 1800 });
    }
  }
}
