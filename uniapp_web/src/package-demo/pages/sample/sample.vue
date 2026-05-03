<template>
  <view class="page">分包路由占位（无业务）</view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { assertAuthedOrRedirectLogin } from "@/router/guard";

onShow(() => {
  assertAuthedOrRedirectLogin();
});
</script>

<style scoped>
.page {
  padding: 24rpx;
}
</style>
