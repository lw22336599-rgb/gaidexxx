<template>
  <vab-card>
    <template #header>
      <div class="header-main">
        <div class="header-left">
          <vab-icon icon="line-chart-fill" />
          月度子账户数据排行
        </div>
        <div class="header-right">
          <div
            class="right-item right-item-pay-top"
            :class="{ 'is-active': currentTab === 1 }"
            @click="getList(1, 'payTop')"
          >
            消耗积分数
          </div>
          |
          <div
            class="right-item right-item-member-top"
            :class="{ 'is-active': currentTab === 2 }"
            @click="getList(2, 'memberTop')"
          >
            名下成员数
          </div>
          |
          <div
            class="right-item right-item-shop-top"
            :class="{ 'is-active': currentTab === 3 }"
            @click="getList(3, 'shopTop')"
          >
            名下店铺数
          </div>
        </div>
      </div>
    </template>
    <el-table v-loading="loading" :data="monthMemberPropsData" style="width: 100%">
      <template #empty>
        <div class="rank-table-empty">暂无数据</div>
      </template>
      <el-table-column label="排名" prop="top" width="100">
        <template #default="scope">
          <div class="sort-box">
            <img v-if="scope.$index == 0" alt="" src="/@/assets/home_images/sorticon1.png" />
            <img v-if="scope.$index == 1" alt="" src="/@/assets/home_images/sorticon2.png" />
            <img v-if="scope.$index == 2" alt="" src="/@/assets/home_images/sorticon3.png" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="账号" prop="user_name" width="300">
        <template #default="scope">
          <div class="shop-box">
            <div class="img-box"><img alt="" src="/@/assets/home_images/zdblogo.png" /></div>
            <div :class="{ 'blur-text': demoMode }">{{ scope.row.user_name }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="账号ID" prop="member_id" width="200">
        <template #default="{ row }">
          <span :class="{ 'blur-text': demoMode }">{{ row.member_id }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="type === 'payTop'" label="上月消耗积分" prop="last_month_count">
        <template #default="{ row }">
          <span :class="{ 'blur-text': demoMode }">{{ row.last_month_count }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="type === 'payTop'" label="累计消耗积分" prop="total">
        <template #default="{ row }">
          <span :class="{ 'blur-text': demoMode }">{{ row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="type === 'memberTop'" label="上月增加成员" prop="last_month_count" />
      <el-table-column v-if="type === 'memberTop'" label="累计成员" prop="total" />
      <el-table-column v-if="type === 'shopTop'" label="美团外卖" prop="mt_count" />
      <el-table-column v-if="type === 'shopTop'" label="饿了么" prop="elm_count" />
    </el-table>
  </vab-card>
</template>
<script setup lang="ts">
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'AccountData'
})

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)
const currentTab = ref(1)
const props = defineProps({
  monthMemberData: {
    type: Object,
    default: () => {}
  }
})
const monthMemberData = props.monthMemberData
const type = ref('payTop')
const monthMemberPropsData = ref([])
const loading = ref(true)
const getList = (num: number, typeStr: string) => {
  loading.value = true
  monthMemberPropsData.value = []
  setTimeout(() => {
    currentTab.value = num
    type.value = typeStr
    monthMemberPropsData.value = monthMemberData[typeStr]
    loading.value = false
  }, 500)
}
watch(
  monthMemberData,
  () => {
    setTimeout(() => {
      loading.value = true
      monthMemberPropsData.value = []
      monthMemberPropsData.value = monthMemberData[type.value]
      loading.value = false
    }, 500)
  },
  { immediate: true }
)
</script>
<style scoped lang="scss">
.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 8px 0 14px;
  box-sizing: border-box;
  border-bottom: 1px solid transparent;

  .header-left {
    line-height: 1.5;
    padding-top: 2px;
  }

  .header-right {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 0;
    padding: 2px 0;

    .right-item {
      cursor: pointer;
      margin: 0 14px;
      padding: 6px 2px;
      opacity: 0.6;
      line-height: 1.4;
      white-space: nowrap;
    }
    .is-active {
      opacity: 1;
      font-weight: 600;
    }
  }
}
.shop-box {
  display: flex;
  align-items: center;
  .img-box {
    width: 32px;
    height: 32px;
    background: #d8d8d8;
    border-radius: 4px;
    margin-right: 5px;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.sort-box {
  width: 22px;
  height: 22px;
  img {
    width: 100%;
    height: 100%;
  }
}

:deep(.blur-text) {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.blur-text {
  filter: blur(4px) !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

:deep(.el-table__empty-block) {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-table-empty {
  width: 100%;
  padding: 48px 20px;
  text-align: center;
  color: #a8abb2;
  font-size: 13px;
  box-sizing: border-box;
}

:deep(.vab-card__header) {
  padding: 14px 18px 0;
}

:deep(.el-card__body) {
  padding: 8px 18px 18px;
}

:deep(.el-table) {
  --el-table-header-bg-color: #eceff4;
}

:deep(.el-table__header-wrapper th.el-table__cell) {
  padding: 14px 8px;
}

:deep(.el-table__body-wrapper .el-table__cell) {
  padding: 16px 8px;
}
</style>
