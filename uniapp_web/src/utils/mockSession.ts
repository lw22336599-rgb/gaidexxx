import { isMockAuthEnabled, MOCK_SESSION_TOKEN } from "@/config/mockAuth";
import { useUserStore } from "@/stores/user";

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
