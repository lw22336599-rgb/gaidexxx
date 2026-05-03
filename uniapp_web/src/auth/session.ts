import { removeToken } from "@/utils/token";

type SessionListener = () => void;
const listeners: SessionListener[] = [];

/** 在 main.ts 挂载 Pinia 后注册，用于 401 时同步清空用户状态 */
export function onSessionInvalid(fn: SessionListener) {
  listeners.push(fn);
}

export function invalidateSession() {
  removeToken();
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[session] listener error", e);
    }
  });
}
