<template>
  <el-drawer :class="{ 'custom-header': true }" v-if="drawerStateCom" v-model="drawerStateCom"
    :before-close="handleClose" direction="rtl" size="auto" :title="funSetName">
    <div class="funczdzzbox">
      <div class="shop-name"><PlatformIcon class="logo" :shop-type="props.currentRow?.shop_type" :size="20" />
        <div class="name-text">{{ currentRow.name }}</div>
      </div>
      <div class="zdcc" v-if="props.drawerFun === 'ZDCC'">
        <func-z-d-c-c :current-row="currentRow" />
      </div>
      <div class="hfbox" v-if="props.drawerFun === 'IMZDHF'">
        <func-z-d-h-f :current-row="currentRow" />
      </div>
      <div v-if="props.drawerFun === 'ZDHP'">
        <func-z-d-h-p :current-row="currentRow" />
      </div>
      <div v-if="props.drawerFun === 'ZDTG'">
        <func-z-d-t-g :current-row="currentRow" />
      </div>
      <div v-if="props.drawerFun === 'CPDT'">
        <func-c-p-d-t :current-row="currentRow" />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import PlatformIcon from '/@/components/PlatformIcon/index.vue'
import FuncCPDT from "/@/views/shop/componentsV2/FuncCPDT.vue";
import FuncZDCC from "/@/views/shop/componentsV2/FuncZDCC.vue";
import FuncZDHF from "/@/views/shop/componentsV2/FuncZDHF.vue";
import FuncZDHP from "/@/views/shop/componentsV2/FuncZDHP.vue";
import FuncZDTG from "/@/views/shop/componentsV2/FuncZDTG.vue";

const props = defineProps({
  drawerState: Boolean,
  currentRow: Object,
  drawerFun: String,
  icon: { type: String, required: false }, // 已废弃，图标由 currentRow.shop_type 通过 PlatformIcon 渲染
})
const drawerStateCom = computed(() => props.drawerState);
const funSetName = ref('')
onMounted(() => {
  funSetName.value = `${funcList.find((item) => item.code === props.drawerFun)?.name}设置`
})
const emit = defineEmits(['closeDrawer']);
const handleClose = () => {
  emit('closeDrawer');
}
const funcList = [
  {
    name: '防漏单',
    code: 'ZDCC'
  },
  {
    name: '自动回评',
    code: 'ZDHP'
  },
  {
    name: '自动点金',
    code: 'ZDTG'
  },
  {
    name: 'IM自动回复',
    code: 'IMZDHF'
  },
  {
    name: '菜品动图',
    code: 'CPDT'
  }
]
</script>
<style>
.custom-header .el-drawer__header {
  margin-bottom: 10px;
}
</style>
<style scoped lang="scss">
// ::v-deep.custom-header .el-drawer__header {
//   margin-bottom: 10px;
// }
.funczdzzbox {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 500px;

  .zdcc {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .hfbox {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    width: 500px;
  }
}

.shop-name {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  :deep() {
    .vab-icon {
      width: 30px;
      height: 30px;
      margin: 0 10px 0 0;
    }
  }

  .name-text {
    font-size: 18px;
    font-weight: 600;
  }
}
</style>