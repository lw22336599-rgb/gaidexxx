<template>
  <view class="page">
    <view class="hero">
      <text class="title">欢迎登录</text>
      <text class="sub">{{ subText }}</text>
    </view>

    <view class="card">
      <view class="field">
        <text class="label">账号</text>
        <input v-model.trim="form.phone" class="input" type="text" placeholder="手机号或用户名" />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input v-model.trim="form.pwd" class="input" password placeholder="请输入密码" />
      </view>

      <view class="row switches">
        <view class="sw">
          <text class="sw-label">记住密码</text>
          <switch :checked="remember" color="#2d6cdf" @change="onRememberChange" />
        </view>
        <view class="sw">
          <text class="sw-label">自动登录</text>
          <switch :checked="vlogin" color="#2d6cdf" @change="onVloginChange" />
        </view>
      </view>

      <button class="btn primary" :loading="loading" @click="handleLogin">登录</button>
      <button v-if="mockMode" class="btn outline" :loading="loading" @click="mockOneClick">
        Mock 一键进首页（免接口）
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { computed, onMounted, reactive, ref } from "vue";
import { AdmiPhoneResultType } from "@/constants/loginResult";
import { isMockAuthEnabled, MOCK_DEFAULT_PHONE } from "@/config/mockAuth";
import { useUserStore } from "@/stores/user";
import { applyMockSessionFromQuery, applyMockSharedLoginState } from "@/utils/mockSession";
import { getToken } from "@/utils/token";

const mockMode = computed(() => isMockAuthEnabled());
const subText = computed(() =>
  mockMode.value
    ? `Mock 已开启 · 默认号 ${MOCK_DEFAULT_PHONE}（密码可任意）· 与 H5 共用 shop-vite-token`
    : "移动端 · 与 PC 端同一套接口"
);

/** H5：打开 `#/pages/login/login?clearStorage=1` 可一键清 Mock/旧 token；带 mock_token / mockBypass 可同步免登 */
onLoad((opts) => {
  const o = (opts || {}) as Record<string, string | undefined>;
  const v = o.clearStorage;
  if (v === "1" || v === "true") {
    uni.removeStorageSync("rememberuser");
    uni.removeStorageSync("vlogin");
    void useUserStore()
      .resetAll()
      .then(() => {
        uni.showToast({ title: "已清理本地缓存", icon: "none" });
      });
  }
  applyMockSessionFromQuery(o);
});

const userStore = useUserStore();
const loading = ref(false);
const remember = ref(true);
const vlogin = ref(true);
const form = reactive({ phone: "", pwd: "" });

function onRememberChange(e: Event) {
  const d = (e as unknown as { detail?: { value?: boolean } }).detail;
  remember.value = !!d?.value;
}
function onVloginChange(e: Event) {
  const d = (e as unknown as { detail?: { value?: boolean } }).detail;
  vlogin.value = !!d?.value;
}

function loadRemembered() {
  try {
    const raw = uni.getStorageSync("rememberuser") as string;
    if (!raw) return;
    const o = JSON.parse(raw) as { phone?: string; pwd?: string };
    if (o.phone) form.phone = o.phone;
    if (o.pwd) form.pwd = o.pwd;
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  if (isMockAuthEnabled() && !form.phone) {
    form.phone = MOCK_DEFAULT_PHONE;
  }
  loadRemembered();
  if (getToken()) {
    uni.reLaunch({ url: "/pages/index/index" });
  }
});

function describeResult(t: number | undefined): string {
  switch (t) {
    case AdmiPhoneResultType.请填写手机号:
      return "请先绑定手机号";
    case AdmiPhoneResultType.需要绑定GoogleAuthenticator:
      return "需绑定 Google 令牌（请在 PC 端完成）";
    case AdmiPhoneResultType.请输入GoogleAuthenticator验证码:
      return "请输入令牌验证码";
    default:
      return t !== undefined ? `登录失败(${t})` : "登录失败";
  }
}

async function mockOneClick() {
  loading.value = true;
  try {
    applyMockSharedLoginState();
    await userStore.getUserInfo();
    uni.reLaunch({ url: "/pages/index/index" });
  } finally {
    loading.value = false;
  }
}

async function handleLogin() {
  const needPwd = !(isMockAuthEnabled() && form.phone.trim() === MOCK_DEFAULT_PHONE);
  if (!form.phone || (needPwd && !form.pwd)) {
    uni.showToast({ title: needPwd ? "请输入账号和密码" : "请输入账号", icon: "none" });
    return;
  }
  loading.value = true;
  try {
    const res = await userStore.login(
      { phone: form.phone, pwd: form.pwd },
      remember.value,
      vlogin.value
    );
    const rt = res.ResultType;
    if (rt === AdmiPhoneResultType.验证成功 || rt === AdmiPhoneResultType.None) {
      try {
        await userStore.getUserInfo();
      } catch {
        /* getUserInfo 失败时仍进入首页，便于排查网络 */
      }
      uni.reLaunch({ url: "/pages/index/index" });
      return;
    }
    uni.showToast({ title: describeResult(rt), icon: "none", duration: 2600 });
  } catch {
    /* request 已 toast */
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 40rpx 80rpx;
  box-sizing: border-box;
  background: linear-gradient(165deg, #e8f0ff 0%, #f6f7fb 42%, #ffffff 100%);
}
.hero {
  margin-bottom: 56rpx;
}
.title {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #1a1a2e;
}
.sub {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
}
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx 48rpx;
  box-shadow: 0 12rpx 40rpx rgba(30, 60, 120, 0.08);
}
.field {
  margin-bottom: 32rpx;
}
.label {
  display: block;
  font-size: 26rpx;
  color: #444;
  margin-bottom: 12rpx;
}
.input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #e5e8ef;
  border-radius: 16rpx;
  font-size: 30rpx;
  background: #fafbfe;
}
.row.switches {
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.sw {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sw-label {
  font-size: 28rpx;
  color: #444;
}
.btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
}
.btn.primary {
  background: #2d6cdf;
  color: #fff;
}
.btn.outline {
  margin-top: 24rpx;
  background: #fff;
  color: #2d6cdf;
  border: 2rpx solid #2d6cdf;
}
</style>
