<template>
  <el-drawer v-model="recycleStateCom" :direction="'rtl'" size="860" title="回收站" @close="closeRecycle">
    <div class="recycle-drawer" style="height: 100%">
      <div class="recycle-container" style="border-top: 1px solid #eaeefb; height: 100%;padding: 20px 10px;">
        <div class="main">
          <div class="head" style="display: flex;align-items: center;justify-content: flex-end">
            <el-input v-model="queryParams.filter.word" placeholder="搜索门店名称或ID或备注" style="width: 175px;" @change="getShopList"/>
          </div>
          <div class="body" style="display: flex;flex-direction: column;flex: 1;overflow: hidden;">
            <el-table v-loading="tableLoading" :data="shopList" height="calc(100vh - 300px)" style="width: 100%; margin-top: 15px;">
              <el-table-column align="left" label="门店名称" width="400">
                <template #default="scope">
                  <div class="mendianbox">
                    <div class="mendianbox-name">
                      <div class="pointer" style="display:flex;align-items: flex-start;color:var(--el-color-primary);font-size:16px" @click="clicname(scope.row)">
                        <vab-icon class="logo" :icon="icon" is-custom-svg/>
                        <span>{{ scope.row.name }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作时间" width="200">
                <template #default="{ row }">
                  <div class="citytext">{{ row.uptim }}</div>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="{ row }">
                  <div style="font-size: 14px;color: var(--el-color-primary);cursor: pointer;" @click="recoverShop(row)">恢复门店</div>
                </template>
              </el-table-column>
            </el-table>
            <vab-pagination
              :current-page="queryParams.page"
              :page-size="queryParams.pageSize"
              :total="total"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import {getShop, recoverBindShop} from "/@/api/shop.ts";
import {gp} from "/@vab/plugins/vab.ts";
import {ElMessageBox} from "element-plus";

const props = defineProps({
  shopType: Number,
  recycleState: Boolean,
  shopTypeStr: String
})
const icon = props.shopTypeStr.replaceAll(/-feature|-operate/g, '')
const recycleStateCom = computed(() => {
  return props.recycleState;
});
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  filter: {
    avtag: false,
    shopType: props.shopType,
    word: ''
  }
})
const tableLoading = ref(false)
const shopList = ref([])
const total = ref(0)
const getShopList = () => {
  tableLoading.value = true
  getShop(queryParams).then((res: any) => {
    if (res.code === 200) {
      shopList.value = res.data.rows
      total.value = res.data.total
    }
  }).finally(() => {
    tableLoading.value = false
  })
}
onMounted(() => {
  getShopList()
})
const handleCurrentChange = (value: number) => {
  queryParams.page = value
  getShopList()
}
const handleSizeChange = (value: number) => {
  queryParams.pageSize = value
  queryParams.page = 1
  getShopList()
}
const emit = defineEmits(['closeRecycle', 'shopRecovered']);
const closeRecycle = () => {
  emit('closeRecycle');
}
const recoverShop = (row) => {
  ElMessageBox.confirm('是否恢复门店？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true,
  }).then(() => {
    recoverBindShop({shopIds: [row.id]}).then(res => {
      if (res.code === 200) {
        gp.$baseMessage('恢复成功!', 'success', 'hey')
        getShopList()
        // 通知父组件刷新列表
        emit('shopRecovered')
      }
    })
  })
  .catch(() => {})
}
</script>
<style scoped lang="scss">
:deep() {
  .pointer {
    .vab-icon {
      margin: 0 6px 0 0;
      width: 24px;
      height: 24px;
    }
  }
}
</style>
