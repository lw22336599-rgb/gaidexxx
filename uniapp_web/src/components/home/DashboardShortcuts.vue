<template>
  <view class="card tile-shell">
    <text class="tile-section-title">快捷功能</text>
    <view class="short-list">
      <view class="short-item" hover-class="short-hover" @click="openCs">
        <view class="fox-wrap">
          <view class="fox-ear fox-ear-l" />
          <view class="fox-ear fox-ear-r" />
          <view class="fox-face">
            <view class="fox-eye fox-eye-l" />
            <view class="fox-eye fox-eye-r" />
            <view class="fox-nose" />
          </view>
        </view>
        <text class="short-label">聚合客服</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function openCs() {
  // #ifdef H5
  uni.navigateTo({
    url: `/pages/admin-pc/admin-pc?path=${encodeURIComponent("/portal")}`,
    fail: () => uni.showToast({ title: "请从 H5 打开", icon: "none" }),
  });
  // #endif
  // #ifndef H5
  uni.showToast({ title: "请在 H5 中打开聚合客服", icon: "none" });
  // #endif
}
</script>

<style scoped>
.tile-shell {
  padding: 28rpx 24rpx 32rpx;
}
.tile-section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1c1c28;
  display: block;
  margin-bottom: 24rpx;
}
.short-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.short-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160rpx;
}
.fox-wrap {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, #ffb347 0%, #ff7e28 45%, #ff6a00 100%);
  box-shadow: 0 8rpx 24rpx rgba(255, 122, 40, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.fox-ear {
  position: absolute;
  top: -6rpx;
  width: 28rpx;
  height: 36rpx;
  background: linear-gradient(180deg, #ff9a3c, #ff6a00);
  border-radius: 50% 50% 40% 40%;
}
.fox-ear-l {
  left: 12rpx;
  transform: rotate(-18deg);
}
.fox-ear-r {
  right: 12rpx;
  transform: rotate(18deg);
}
.fox-face {
  position: relative;
  width: 72rpx;
  height: 64rpx;
  background: linear-gradient(180deg, #fff5e6 0%, #ffe0c2 100%);
  border-radius: 50% 50% 48% 48%;
  margin-top: 8rpx;
}
.fox-eye {
  position: absolute;
  top: 22rpx;
  width: 10rpx;
  height: 12rpx;
  background: #2c2c2c;
  border-radius: 50%;
}
.fox-eye-l {
  left: 18rpx;
}
.fox-eye-r {
  right: 18rpx;
}
.fox-nose {
  position: absolute;
  bottom: 14rpx;
  left: 50%;
  width: 14rpx;
  height: 10rpx;
  margin-left: -7rpx;
  background: #3a2a1f;
  border-radius: 40%;
}
.short-label {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #303133;
  text-align: center;
}
.short-hover {
  opacity: 0.9;
}
</style>
