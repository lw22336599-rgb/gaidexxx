/**
 * 精简版 faster-move-web `src/store/modules/user.ts`（单例 + ref，避免 Pinia 与 uni 模板 Vue 版本 peer 冲突）
 */
import { ref } from "vue";
import * as userApi from "@/api/user";
import { tokenName } from "@/config/setting.config";
import { AdmiPhoneResultType } from "@/constants/loginResult";
import { getToken, removeToken, setToken as persistToken } from "@/utils/token";
import { isArray, isString } from "@/utils/validate";

interface LoginPayload {
  phone: string;
  pwd: string;
  bind_phone?: string;
  bind_phone_code?: string;
  ga_code?: string;
}

const token = ref(getToken());
const username = ref("游客");
const avatar = ref("");
const roles = ref<string[]>([]);

function setToken(t: string) {
  token.value = t;
  if (t) persistToken(t);
  else removeToken();
  syncSharedLoginState();
}

function setUsername(name: string) {
  username.value = name;
}

function setAvatar(a: string) {
  avatar.value = a;
}

function afterLogin(t: string) {
  if (t) {
    setToken(t);
    uni.showToast({ title: "登录成功", icon: "success" });
  } else {
    const err = `登录接口异常，未正确返回${tokenName}`;
    uni.showToast({ title: err, icon: "none" });
    throw new Error(err);
  }
}

function unwrapLoginPayload(raw: unknown): { ResultType?: number; Token?: string } {
  if (!raw || typeof raw !== "object") return {};
  let cur: Record<string, unknown> = raw as Record<string, unknown>;
  const d = cur.data;
  if (
    d &&
    typeof d === "object" &&
    ("ResultType" in (d as object) || "resultType" in (d as object))
  ) {
    cur = d as Record<string, unknown>;
  }
  if (cur.data && typeof cur.data === "object" && ("ResultType" in cur.data || "resultType" in cur.data)) {
    cur = cur.data as Record<string, unknown>;
  }
  const rtRaw = cur.ResultType ?? cur.resultType;
  const tok = cur.Token ?? cur.token;
  return {
    ResultType: rtRaw !== undefined && rtRaw !== null ? Number(rtRaw) : undefined,
    Token: tok !== undefined && tok !== null ? String(tok) : undefined,
  };
}

async function login(userInfo: LoginPayload, remember: boolean, vlogin: boolean) {
  const res = (await userApi.login(userInfo as unknown as Record<string, unknown>)) as {
    data?: unknown;
  };
  const inner = unwrapLoginPayload(res);
  const rt = inner.ResultType;
  if (
    rt === AdmiPhoneResultType.验证成功 ||
    rt === AdmiPhoneResultType.None ||
    rt === 0 ||
    rt === 5
  ) {
    if (remember) {
      uni.setStorageSync("rememberuser", JSON.stringify(userInfo));
    } else {
      uni.setStorageSync("rememberuser", JSON.stringify({ phone: userInfo.phone, pwd: "" }));
    }
    uni.setStorageSync("vlogin", vlogin ? "1" : "0");
    afterLogin(inner.Token || "");
    return { ResultType: rt, Token: inner.Token };
  }
  return { ResultType: rt, Token: inner.Token };
}

function syncSharedLoginState() {
  try {
    const uiRaw = uni.getStorageSync("userInfo");
    let userInfoForShare: string | null = null;
    if (uiRaw == null || uiRaw === "") {
      userInfoForShare = null;
    } else if (typeof uiRaw === "string") {
      userInfoForShare = uiRaw;
    } else {
      userInfoForShare = JSON.stringify(uiRaw);
    }
    uni.setStorageSync("sharedLoginState", JSON.stringify({
      token: token.value || "",
      userInfo: userInfoForShare,
      ts: Date.now(),
    }));
  } catch {
    /* ignore */
  }
}

/** 从本地 userInfo 缓存恢复「我的」等页的展示字段（与 getUserInfo 成功后的内存态对齐） */
function hydrateProfileFromStorage() {
  try {
    const raw = uni.getStorageSync("userInfo") as string;
    if (!raw || typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return;
    const data = JSON.parse(raw) as {
      admin?: {
        user_name?: string;
        avatar?: string;
        role?: unknown;
      };
    };
    const admin = data.admin;
    if (!admin) return;
    if (admin.user_name && isString(admin.user_name)) setUsername(admin.user_name);
    if (admin.avatar != null && isString(admin.avatar)) setAvatar(admin.avatar);
    if (admin.role && isArray(admin.role)) {
      roles.value = admin.role.filter((r): r is string => isString(r));
    } else {
      roles.value = [];
    }
  } catch {
    /* ignore */
  }
}

async function getUserInfo(opts?: { silent?: boolean }) {
  const silent = opts?.silent === true;
  const res = (await userApi.getUserInfo()) as {
    data?: {
      admin?: {
        user_name?: string;
        avatar?: string;
        role?: unknown;
        id?: number;
        phone?: string;
        notes?: string;
        balance?: string | number;
        code?: string;
        crtim?: string;
        uptim?: string;
      };
    };
  };
  const data = res.data;
  if (!data) {
    const err = "用户信息为空";
    uni.showToast({ title: err, icon: "none" });
    throw new Error(err);
  }
  uni.setStorageSync("userInfo", JSON.stringify(data));
  syncSharedLoginState();
  const admin = data.admin;
  const user_name = admin?.user_name;
  const av = admin?.avatar;
  const role = admin?.role;
  if (
    (user_name && !isString(user_name)) ||
    (av && !isString(av)) ||
    (role && !isArray(role))
  ) {
    const err = "getUserInfo 返回格式异常";
    if (!silent) uni.showToast({ title: err, icon: "none" });
    throw new Error(err);
  }
  if (user_name) setUsername(user_name);
  if (av) setAvatar(av);
  if (role && isArray(role)) {
    roles.value = role.filter((r): r is string => isString(r));
  } else {
    roles.value = [];
  }
}

function resetLocal() {
  removeToken();
  token.value = "";
  username.value = "游客";
  avatar.value = "";
  roles.value = [];
  uni.removeStorageSync("sharedLoginState");
}

async function resetAll() {
  resetLocal();
  uni.removeStorageSync("userInfo");
  try {
    uni.removeStorageSync("mineShopPlatformCounts");
  } catch {
    /* ignore */
  }
}

async function logout() {
  await resetAll();
  uni.reLaunch({ url: "/pages/login/login" });
}

export function useUserStore() {
  return {
    token,
    username,
    avatar,
    roles,
    setToken,
    setUsername,
    setAvatar,
    login,
    getUserInfo,
    hydrateProfileFromStorage,
    resetLocal,
    resetAll,
    logout,
  };
}
