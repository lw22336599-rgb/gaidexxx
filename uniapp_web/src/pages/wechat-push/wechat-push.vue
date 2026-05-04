<template>
  <PcTabEmbed title="微信推送-经营日报推送" :hash-path="ALIGNED_PC_HASH.SHOP_WECHAT_TS" />
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ALIGNED_PC_HASH } from "@/config/alignedPcRoutes";
import PcTabEmbed from "@/components/PcTabEmbed.vue";
import { setTabBarPageIndex } from "@/utils/tabBarIndex";

onShow(() => setTabBarPageIndex(2));
</script>
