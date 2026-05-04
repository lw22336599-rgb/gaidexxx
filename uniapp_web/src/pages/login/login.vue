<template>
  <view class="page">
    <view class="top">
      <text class="brand">极狐</text>
      <text class="tagline">账号登录</text>
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
      <view class="opts">
        <view class="opt" @tap="remember = !remember">
          <view class="chk" :class="{ on: remember }" />
          <text class="opt-t">记住密码</text>
        </view>
        <view class="opt" @tap="vlogin = !vlogin">
          <view class="chk" :class="{ on: vlogin }" />
          <text class="opt-t">自动登录</text>
        </view>
      </view>

      <button class="btn primary" :loading="loading" @click="handleLogin">登 录</button>
      <button v-if="mockMode" class="btn ghost" :loading="loading" :disabled="loading" @click="mockOneClick">
        开发环境 · 免接口进首页
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { computed, onMounted, reactive, ref } from "vue";
import { ROUTE_BUSINESS_HOME } from "@/config/routes";
import { AdmiPhoneResultType } from "@/constants/loginResult";
import { isMockAuthEnabled, MOCK_DEFAULT_PHONE } from "@/config/mockAuth";
import { useUserStore } from "@/stores/user";
import { applyMockSessionFromQuery, applyMockSharedLoginState } from "@/utils/mockSession";
import { getToken } from "@/utils/token";

const mockMode = computed(() => isMockAuthEnabled());

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

async function mockOneClick() {
  loading.value = true;
  try {
    applyMockSharedLoginState();
    await userStore.getUserInfo();
    uni.reLaunch({ url: ROUTE_BUSINESS_HOME });
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
  padding: 56rpx 8rpx 40rpx;
}
.brand {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 4rpx;
}
.tagline {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #606266;
}
.sheet {
  flex: 1;
  min-height: 0;
}
.field {
  margin-bottom: 28rpx;
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
  height: 96rpx;
  padding: 0 28rpx;
  box-sizing: border-box;
  border: 1rpx solid #dcdfe6;
  border-radius: 18rpx;
  font-size: 32rpx;
  background: #fff;
}
.foot {
  flex-shrink: 0;
  padding-top: 8rpx;
}
.opts {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 28rpx;
  padding: 0 4rpx;
}
.opt {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 8rpx;
  margin: -16rpx -8rpx;
}
.chk {
  width: 32rpx;
  height: 32rpx;
  border-radius: 8rpx;
  border: 2rpx solid #c0c4cc;
  box-sizing: border-box;
  background: #fff;
}
.chk.on {
  border-color: #2d6cdf;
  background: #2d6cdf;
  box-shadow: inset 0 0 0 4rpx #fff;
}
.opt-t {
  font-size: 28rpx;
  color: #606266;
}
.btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 18rpx;
  font-size: 34rpx;
  font-weight: 600;
}
.btn.primary {
  background: #2d6cdf;
  color: #fff;
}
.btn.ghost {
  margin-top: 20rpx;
  background: transparent;
  color: #909399;
  border: 1rpx dashed #dcdfe6;
  font-size: 26rpx;
  font-weight: 400;
  height: 80rpx;
  line-height: 80rpx;
}
</style>
