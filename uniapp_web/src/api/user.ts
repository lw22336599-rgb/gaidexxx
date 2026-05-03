/**
 * 对齐 faster-move-web `src/api/user.ts`
 */
import {
  isAllowedMockLoginPayload,
  isMockAuthEnabled,
  isMockSessionToken,
  mockGetUserInfoEnvelope,
  mockLoginSuccessEnvelope,
} from "@/config/mockAuth";
import { loginRSA } from "@/config/setting.config";
import { getToken } from "@/utils/token";
import { get, post } from "@/utils/request";

export async function login(data: Record<string, unknown>) {
  if (isMockAuthEnabled()) {
    if (!isAllowedMockLoginPayload(data)) {
      uni.showToast({
        title: "Mock 模式仅支持默认测试账号登录",
        icon: "none",
        duration: 2600,
      });
      return Promise.reject(new Error("MOCK_FORBIDDEN"));
    }
    return Promise.resolve({ ...mockLoginSuccessEnvelope() });
  }
  if (loginRSA) {
    throw new Error("当前移动端工程未接入 RSA 登录；请先在 setting.config 将 loginRSA 设为 false，或参考 PC 端补齐 encrypt/publicKey。");
  }
  return post("/admin/agencylogin", data);
}

export function getUserInfo() {
  if (isMockAuthEnabled() && isMockSessionToken(getToken())) {
    return Promise.resolve({ ...mockGetUserInfoEnvelope() });
  }
  return get("/admin/getagencyinfo");
}
