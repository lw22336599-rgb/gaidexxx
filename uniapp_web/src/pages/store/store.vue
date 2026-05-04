<template>
  <PcTabEmbed title="极狐" :hash-path="ALIGNED_PC_HASH.SHOP_V2_FUNCTIONAL" />
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ALIGNED_PC_HASH } from "@/config/alignedPcRoutes";
import PcTabEmbed from "@/components/PcTabEmbed.vue";
import { setTabBarPageIndex } from "@/utils/tabBarIndex";

onShow(() => setTabBarPageIndex(1));
</script>
