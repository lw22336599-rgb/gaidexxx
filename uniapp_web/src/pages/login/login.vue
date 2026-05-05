<template>
  <view class="page">
    <view class="top">
      <text class="brand">极狐</text>
    </view>

    <view class="sheet">
      <view class="field">
        <text class="label">账号</text>
        <input
          v-model.trim="form.phone"
          class="input"
          type="text"
          confirm-type="next"
          placeholder="手机号或用户名"
        />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input
          v-model.trim="form.pwd"
          class="input"
          password
          confirm-type="done"
          placeholder="请输入密码"
          @confirm="handleLogin"
        />
      </view>
    </view>

    <view class="foot">
      <button
        class="btn primary"
        type="button"
        :loading="loading"
        :disabled="loading"
        hover-class="btn-hover"
        @tap.stop="handleLogin"
      >
        登 录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from "@dcloudio/uni-app";
import { onMounted, reactive, ref } from "vue";
import { ROUTE_BUSINESS_HOME } from "@/config/routes";
import { AdmiPhoneResultType } from "@/constants/loginResult";
import { isMockAuthEnabled, MOCK_DEFAULT_PHONE } from "@/config/mockAuth";
import { useUserStore } from "@/stores/user";
import { applyMockSessionFromQuery, hydrateLoginStateFromShared } from "@/utils/mockSession";
import { getToken } from "@/utils/token";

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

function syncLoginUiState() {
  hydrateLoginStateFromShared();
  if (getToken() && !userStore.token.value) {
    userStore.setToken(getToken());
  }
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
  syncLoginUiState();
  if (getToken()) {
    uni.reLaunch({ url: ROUTE_BUSINESS_HOME });
  }
});

onShow(() => {
  syncLoginUiState();
  if (getToken()) {
    uni.reLaunch({ url: ROUTE_BUSINESS_HOME });
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
      vlogin.value,
    );
    const rt = res.ResultType;
    if (rt === AdmiPhoneResultType.验证成功 || rt === AdmiPhoneResultType.None) {
      try {
        await userStore.getUserInfo();
      } catch {
        /* getUserInfo 失败时仍进入首页，便于排查网络 */
      }
      uni.reLaunch({ url: ROUTE_BUSINESS_HOME });
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
  display: flex;
  flex-direction: column;
  padding: calc(24rpx + env(safe-area-inset-top)) 36rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: linear-gradient(180deg, #eef3fc 0%, #f7f8fb 28%, #ffffff 55%);
}
.top {
  flex-shrink: 0;
  padding: 32rpx 8rpx 20rpx;
}
.brand {
  display: block;
  font-size: 50rpx;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 4rpx;
}
.sheet {
  flex: 1;
  min-height: 0;
}
.field {
  margin-bottom: 20rpx;
}
.label {
  display: block;
  font-size: 26rpx;
  color: #303133;
  margin-bottom: 12rpx;
  font-weight: 500;
}
.input {
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #dcdfe6;
  border-radius: 18rpx;
  font-size: 30rpx;
  background: #fff;
}
.foot {
  flex-shrink: 0;
  padding-top: 2rpx;
}
.btn {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 18rpx;
  font-size: 32rpx;
  font-weight: 600;
}
.btn.primary {
  background: #2d6cdf;
  color: #fff;
}
.btn-hover {
  opacity: 0.92;
}
</style>
