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

function setToken(t: string) {
  token.value = t;
  if (t) persistToken(t);
  else removeToken();
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

async function login(userInfo: LoginPayload, remember: boolean, vlogin: boolean) {
  const res = (await userApi.login(userInfo as unknown as Record<string, unknown>)) as {
    data?: { ResultType?: number; Token?: string };
  };
  const inner = (res.data ?? {}) as { ResultType?: number; Token?: string };

  if (remember) {
    uni.setStorageSync("rememberuser", JSON.stringify(userInfo));
  } else {
    uni.setStorageSync("rememberuser", JSON.stringify({ phone: userInfo.phone, pwd: "" }));
  }
  uni.setStorageSync("vlogin", vlogin ? "1" : "0");

  if (inner.ResultType === AdmiPhoneResultType.验证成功 || inner.ResultType === AdmiPhoneResultType.None) {
    afterLogin(inner.Token || "");
    return inner;
  }
  return inner;
}

async function getUserInfo() {
  const res = (await userApi.getUserInfo()) as {
    data?: {
      admin?: { user_name?: string; avatar?: string; role?: unknown; id?: number };
    };
  };
  const data = res.data;
  if (!data) {
    const err = "用户信息为空";
    uni.showToast({ title: err, icon: "none" });
    throw new Error(err);
  }
  uni.setStorageSync("userInfo", JSON.stringify(data));
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
    uni.showToast({ title: err, icon: "none" });
    throw new Error(err);
  }
  if (user_name) setUsername(user_name);
  if (av) setAvatar(av);
}

function resetLocal() {
  removeToken();
  token.value = "";
  username.value = "游客";
  avatar.value = "";
}

async function resetAll() {
  resetLocal();
  uni.removeStorageSync("userInfo");
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
    setToken,
    setUsername,
    setAvatar,
    login,
    getUserInfo,
    resetLocal,
    resetAll,
    logout,
  };
}
