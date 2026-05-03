import { tokenTableName } from "@/config/setting.config";

export function getToken(): string {
  return (uni.getStorageSync(tokenTableName) as string) || "";
}

export function setToken(token: string) {
  uni.setStorageSync(tokenTableName, token);
}

export function removeToken() {
  uni.removeStorageSync(tokenTableName);
}
