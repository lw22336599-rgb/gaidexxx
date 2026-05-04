<template>
  <el-dialog
    v-model="addShopAfterStateCom"
    :before-close="handleCloseShopAfter"
    :title="isBind ? '店铺绑定成功' : '店铺添加成功'"
    width="30%"
  >
    <div>
      <div style="margin-bottom: 15px"><span>店铺名称：</span> {{ props.addShopAfterObj.name }}</div>
      <div style="margin-bottom: 15px"><span>门店ID： </span> {{ props.addShopAfterObj.office_id }}</div>
      <div v-if="!isBind" style="margin-bottom: 5px">
        <span>解除店铺已绑账号管理权限：</span>
        <el-switch v-model="reset_powerCom" @change="changeResetState" />
      </div>
      <div v-if="!isBind" class="reset-tips">
        注意!一旦打开此开关，本软件内与该店铺绑定的所有账号将失去管理权限，这意味着之前绑定的账号将无法对店铺进行管理操作，只能重新通过门店绑定码绑定!
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCloseShopAfter">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { addShop } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'

const props = defineProps({
  isBind: Boolean,
  addShopAfterState: Boolean,
  addShopAfterObj: Object
})
const addShopAfterStateCom = computed(() => props.addShopAfterState)
const reset_powerCom = computed(() => props.addShopAfterObj.reset_power)
const emit = defineEmits(['closeShopAfter'])
const handleCloseShopAfter = () => {
  emit('closeShopAfter')
}
const changeResetState = () => {
  ElMessageBox.confirm('确认进行此操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true
  })
    .then(() => {
      const { shop_type, shop_user, shop_pwd, cookies } = props.addShopAfterObj
      addShop({ shop_type, shop_user, shop_pwd, cookies, reset_power: reset_powerCom.value }).then((res: any) => {
        if (res.code === 200) {
          gp.$baseMessage('操作成功!', 'success', 'hey')
        }
      })
    })
    .catch(() => {
      reset_powerCom.value = !reset_powerCom.value
    })
}
</script>
<style scoped lang="scss">
.reset-tips {
  color: #fe0000;
  line-height: 1.5;
}
</style>
