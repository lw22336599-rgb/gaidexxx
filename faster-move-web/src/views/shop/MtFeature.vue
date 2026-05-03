<template>
  <div class="page-container">
    <shop-header :shop-type="shopType" :shop-type-str="shopTypeStr" />
    <el-divider />
    <screen :query-params="queryParams.filter" :shop-type="shopType" :shop-type-str="shopTypeStr"
      @update-query-params="setParams" />
    <shop-table :list-loading="tableLoading" :page="queryParams.page" :page-size="queryParams.pageSize"
      :shop-list="shopList" :shop-type="shopType" :shop-type-str="shopTypeStr" :total="total"
      @update-page="updatePage" />
  </div>
</template>
<script setup lang="ts">
import Screen from "/@/views/shop/componentsV2/Screen.vue";
import ShopHeader from '/@/views/shop/componentsV2/ShopHeader.vue'
import { getShop, getShopFdmv } from "/@/api/shop.ts";
import ShopTable from "/@/views/shop/componentsV2/ShopTable.vue";
import { useRoute } from 'vue-router';
import { watch, nextTick, computed } from 'vue';

const route = useRoute();
const shopTypeStr = computed(() => route.meta.typeStr as string | undefined);
const isFeature = ref(true)
if (shopTypeStr.value && shopTypeStr.value.includes('feature')) {
  isFeature.value = true
} else {
  isFeature.value = false
}
// 使用 computed 使 shopType 响应式更新
const shopType = computed(() => route.meta.type as number);
const tableLoading = ref(false)
const total = ref(0)
const shopList = ref([])

// 防止重复加载的标志
let isFetching = false
// 是否在切换店铺类型（用于决定是否保持旧数据）
let isChangingShopType = false

// 功能版
defineOptions({
  name: 'MtFeature',
})
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  filter: {
    time_state: undefined,
    shopType: shopType.value,
    word: undefined,
    group: undefined,
    state: undefined,
    ck_online: undefined,
    citys: undefined,
    func_code: undefined,
    func_state: undefined,
    avtag: undefined
  }
})

/** 将 func_info / func_enable 展平到 item：item[code]、item[code+'time']，支持后端动态功能 */
function updateFuncInfo(item: any, funcInfo: any): void {
  (funcInfo || []).forEach((func: any) => {
    if (!func?.code) return;
    item[func.code] = func?.enable ?? false;
    item[`${func.code}time`] = setTime(func?.end_time);
  });
}

const setTime = (date?: string | null): string => {
  if (date) {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) { // 检查是否是一个有效的日期
      let y = dateObj.getFullYear();
      let m: string | number = dateObj.getMonth() + 1;
      m = m < 10 ? `0${m}` : m.toString();
      let d: string | number = dateObj.getDate();
      d = d < 10 ? `0${d}` : d.toString();
      return `${y}-${m}-${d}`;
    }
  }
  return '已到期';
};

const getShopList = async (data: any, keepOldData = false) => {
  // 如果正在加载中，直接返回，避免重复加载
  if (isFetching) {
    return
  }

  isFetching = true

  // 如果不需要保持旧数据，立即显示 loading
  // 如果需要保持旧数据（切换店铺类型时），不显示 loading，保持旧数据可见
  if (!keepOldData) {
    tableLoading.value = true
  }

  try {
    const res: any = await getShopFdmv(data)
    if (res && res.code === 200) {
      // 准备新数据
      const newShopList = (res.data.rows || []).map((item: any) => {
        if (item.img && !item.img.startsWith('http')) {
          item.img = `http://${item.img}`;
        }
        item.tooltipshow = false;

        // 统一功能数据源：优先使用 func_info，如果没有则使用 extra_data.func_enable
        // 与 MtFeatureV2Functional 中的实现保持一致，确保续费后到期时间显示一致
        let funcSource = item.func_info;
        if (!Array.isArray(funcSource) || funcSource.length === 0) {
          funcSource = item.extra_data?.func_enable;
        }

        if (Array.isArray(funcSource) && funcSource.length > 0) {
          updateFuncInfo(item, funcSource);
        } else {
          ['ZDCC', 'ZDHP', 'IMZDHF', 'ZDTG'].forEach(code => {
            item[code] = false;
            item[`${code}time`] = '已到期';
          });
          item.CPDTtime = "";
        }

        if (item.work_time?.WorkTimeList) {
          const [workTime] = item.work_time.WorkTimeList;
          item.yetime = workTime ? `${workTime.Start.slice(0, -3)}-${workTime.End.slice(0, -3)}` : '';
        } else {
          item.yetime = '';
        }
        return item;
      });

      // 使用 nextTick 确保 DOM 更新平滑，避免闪烁
      await nextTick()
      // 直接更新数据，保持平滑过渡
      shopList.value = newShopList
      total.value = res.data.total || 0
    }
  } finally {
    tableLoading.value = false
    isFetching = false
  }
}

/**
 * 处理筛选参数变化
 */
const setParams = (data: any) => {
  queryParams.filter = { ...data, shopType: shopType.value }
  queryParams.page = 1 // 筛选时重置页码
  getShopList(queryParams, true) // 保持旧数据，避免闪烁
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

// 监听路由变化，当店铺类型变化时重新加载店铺列表
watch(() => route.meta.type, (newType, oldType) => {
  // 只有在当前组件对应的路由时才执行
  // MtFeature 组件被多个路由共享，需要匹配所有相关路由名称
  const validRouteNames = [
    'MtFeature',
    'ElmFeature',
    'ElmFeature_official',
    'JdHomeFeature',
    'MtShopFeature',
    'MtMedicineFeature',
    'ElmRetailFeature',
    'DyRetailFeature'
  ]

  if (!validRouteNames.includes(route.name as string)) {
    return
  }

  // 如果店铺类型有值且发生变化
  if (newType !== undefined) {
    // 如果正在加载中，直接返回，避免重复调用
    if (isFetching) {
      return
    }

    // 如果正在切换中，直接返回，避免重复调用
    if (isChangingShopType) {
      return
    }

    // 如果是首次加载或店铺类型发生变化，重新加载数据
    if (oldType === undefined || newType !== oldType) {
      isChangingShopType = true

      // 更新 queryParams 中的 shopType
      queryParams.filter.shopType = newType as number
      queryParams.page = 1

      // 切换店铺类型时保持旧数据，避免页面闪烁
      getShopList(queryParams, true).finally(() => {
        // 使用 nextTick 确保在下一个事件循环中重置标志
        nextTick(() => {
          isChangingShopType = false
        })
      })
    }
  }
}, { immediate: true })
</script>
<style scoped lang="scss">
:deep() {
  .el-divider--horizontal {
    margin: 12px 0;
  }
}
</style>