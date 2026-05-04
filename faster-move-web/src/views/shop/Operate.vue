<template>
  <div class="page-container">
    <shop-header :shop-type="shopType" :shop-type-str="shopTypeStr" />
    <el-divider />
    <screen
      :query-params="queryParams.filter"
      :shop-type="shopType"
      :shop-type-str="shopTypeStr"
      @update-query-params="setParams"
    />
    <shop-table
      :list-loading="tableLoading"
      :page="queryParams.page"
      :page-size="queryParams.pageSize"
      :shop-list="shopList"
      :shop-type="shopType"
      :shop-type-str="shopTypeStr"
      :total="total"
      @update-page="updatePage"
    />
  </div>
</template>
<script setup lang="ts">
import Screen from '/@/views/shop/componentsV2/Screen.vue'
import ShopHeader from '/@/views/shop/componentsV2/ShopHeader.vue'
import { getShopV2 } from '/@/api/shop.ts'
import ShopTable from '/@/views/shop/componentsV2/ShopTableOperate.vue'
import { useRoute } from 'vue-router'
defineOptions({
  name: 'Operate'
})
const route = useRoute()
const shopTypeStr = route.meta.typeStr as string | undefined
const shopType = route.meta.type as number
const tableLoading = ref(false)
const total = ref(0)
const shopList = ref([])

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  filter: {
    time_state: undefined,
    shopType,
    word: undefined,
    group: undefined,
    state: undefined,
    ck_online: undefined,
    citys: undefined,
    func_code: 'APPDATA',
    func_state: 1,
    avtag: undefined
  }
})
const setParams = (data: any) => {
  queryParams.filter = data
  getShopList(queryParams)
}
const updatePage = (pageObj: any) => {
  if (pageObj.page) {
    queryParams.page = pageObj.page
  }
  if (pageObj.pageSize) {
    queryParams.pageSize = pageObj.pageSize
  }
  getShopList(queryParams)
}

const getShopList = (data: any) => {
  tableLoading.value = true
  getShopV2(data)
    .then((res: any) => {
      if (res && res.code === 200) {
        shopList.value = res.data.rows
        // 运营版到期时间
        shopList.value = shopList.value.map(item => {
          // item.appendtime='';
          let arr = item.extra_data.func_enable.filter(itemcode => itemcode.code == 'APPDATA')
          if (arr && arr.length) {
            item.appendtime = arr[0].end_time.slice(0, 10)
          }
          return item
        })
        total.value = res.data.total
      }
    })
    .finally(() => {
      tableLoading.value = false
    })
}
getShopList(queryParams)
</script>
<style scoped lang="scss">
:deep() {
  .el-divider--horizontal {
    margin: 12px 0;
  }
}
</style>
