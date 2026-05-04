<template>
  <div class="index-container no-background-container">
    <div class="index-dashboard-shell">
      <el-row :gutter="20" class="row-container row-container--metrics">
        <el-col
          v-for="item in topData"
          :key="item.key"
          :lg="6"
          :md="12"
          :sm="12"
          :span="6"
          :xs="24"
          class="top-card-col"
          :class="{ clickable: !!item.target }"
          @click="onTopCardTap(item)"
        >
          <top-card background="white" :count-config="item" percentage="10%" :title="item.title" />
        </el-col>
      </el-row>

      <div class="index-body-grid">
        <div class="index-body-main">
          <home-echart
            :add-num="addNum"
            :centre="centre"
            :integral="integral"
            :prov="prov"
            :x-axis-data="xAxisData"
            :jd-data="JdData"
            @open-tour="openTour"
          />
          <account-data :month-member-data="monthMemberData" />
        </div>
        <aside class="index-body-aside">
          <todo-list :todo-data="todoData" />
          <team-list :team-top-list="teamTopList" />
          <update-log :update-top="updateTop" />
        </aside>
      </div>
    </div>
    <el-tour v-model="tourState" :type="type">
      <el-tour-step
        v-for="step in steps"
        :key="step"
        :description="step.description"
        :target="step.target"
        :title="step.title"
      />
    </el-tour>
  </div>
</template>

<script lang="ts" setup>
import { getHomeData } from '/@/api/business.ts'
import { fetchHomeAggregate, subscribeEvents } from '/@/api/userOperate'
import { ALIGNED_PC_HASH, shopV2HashForPlatform } from '/@/config/alignedPcRoutes'
import { isDevMockOn, refreshDevMockConfig } from '/@/config/devMock'
import AccountData from '/@/views/index/accountData.vue'
import HomeEchart from '/@/views/index/homeEchart.vue'
import UpdateLog from '/@/views/index/updateLog.vue'
import TeamList from '/src/views/index/teamList.vue'
import TodoList from '/@/views/index/todoList.vue'
import router from '/@/router'
defineOptions({
  name: 'Index'
})

/** 顶部 4 张卡片：与 uni-app H5 内嵌路径对齐（门店 → shop-v2；成员/积分 → 团队管理） */
function onTopCardTap(item: any) {
  const t = item && item.target
  if (!t) return
  if (t.type === 'stores') {
    router.push(shopV2HashForPlatform(t.platform))
    return
  }
  if (t.type === 'users') {
    const key = String(item.key || '')
    if (key.includes('integral')) {
      router.push(ALIGNED_PC_HASH.TEAM_POINT)
      return
    }
    router.push(ALIGNED_PC_HASH.TEAM_MEMBER)
    return
  }
  if (t.type === 'todos') {
    router.push(ALIGNED_PC_HASH.USER_OPERATE_TODOS)
  }
}

/**
 * 数据源由总开关 VITE_USE_MOCK 决定：
 * - true  => dev-bridge 聚合（开发环境 Mock 数据）
 * - false => 真实后端 getHomeData()
 * 切换时页面渲染、事件绑定、同步关联关系保持不变。
 */
async function resolveHome(): Promise<any> {
  if (isDevMockOn()) {
    try {
      const bridgeRes = await fetchHomeAggregate()
      if (bridgeRes && bridgeRes.code === 200 && bridgeRes.data) {
        return { code: 200, data: bridgeRes.data }
      }
    } catch (_e) {
      /* fallthrough to real backend */
    }
  }
  return await getHomeData()
}

const homeData = ref<any>({})
const topData = ref<any>([])
const lastWeek = ref<any>([])
const xAxisData = ref<any>([])
const centre = ref<any>([])
const prov = ref<any>([])
const addNum = ref<any>([])
const integral = ref<any>([])
const JdData = ref<any>([])
const monthMemberData = reactive({
  payTop: [],
  memberTop: [],
  shopTop: []
})
const todoData = reactive({
  done: 0,
  undone: 0
})
const teamTopList = ref<any>([])
const updateTop = ref<any>([])
const getData = async () => {
  const res: any = await resolveHome()
  if (!res || res.code !== 200 || !res.data) return
  homeData.value = res.data
  const td = (res.data.top_data || {}) as Record<string, any>
  const preferred = ['mt_shop_today', 'elm_shop_today', 'member_today', 'integral_today']
  const keys = Object.keys(td)
  let ordered = preferred.filter(k => keys.includes(k))
  for (const k of keys) {
    if (!ordered.includes(k)) ordered.push(k)
  }
  ordered = ordered.slice(0, 4)
  topData.value = ordered.slice(0, 4).map(key => ({
    key,
    startValue: 0,
    decimals: 0,
    prefix: '',
    suffix: '',
    separator: ',',
    duration: 1200,
    ...td[key]
  }))
  topData.value.forEach((item: any) => {
    item.count = Math.abs(Number(item.count) || 0)
  })
  lastWeek.value = res.data.last_week || {}
  xAxisData.value = []
  centre.value = []
  prov.value = []
  addNum.value = []
  JdData.value = []
  integral.value = []
  for (const key in lastWeek.value) {
    const row = lastWeek.value[key] || {}
    xAxisData.value.push(key)
    centre.value.push(Number(row['美团店铺'] || 0))
    prov.value.push(Number(row['饿了么店铺'] || 0))
    addNum.value.push(Number(row['新增成员'] || 0))
    JdData.value.push(Number(row['京东到家'] || 0))
    integral.value.push(row['积分消耗'] ? Math.abs(Number(row['积分消耗'])) : 0)
  }
  monthMemberData.payTop = res.data.month_pay_member || []
  monthMemberData.memberTop = res.data.month_member_count || []
  monthMemberData.shopTop = res.data.month_shop_count || []
  todoData.done = Number(res.data.calendar_count?.done || 0)
  todoData.undone = Number(res.data.calendar_count?.undone || 0)
  teamTopList.value = [...(res.data.BalanceTop || [])]
  updateTop.value = [...(res.data.update_top10 || [])]
  updateTop.value.forEach((item: any) => {
    if (typeof item.content === 'string') {
      item.content = item.content.replaceAll('\n', '<br>')
    }
  })
}

/** SSE 实时同步：debounce 1s 重新拉取，避免高频抖动 */
let pendingTimer: ReturnType<typeof setTimeout> | null = null
let unsubscribeEvents: (() => void) | null = null
function scheduleRefresh() {
  if (pendingTimer) return
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    void getData()
  }, 600)
}

const type = ref<any>('primary')
const tourState = ref<boolean>(false)
const steps = ref<any>([
  {
    target: '.vab-dark',
    title: '暗黑模式',
    description: '这里是暗黑模式切换'
  },
  {
    target: '.ri-font-size-2',
    title: '字体大小',
    description: '这里是改变字体大小'
  },
  {
    target: '.ri-notification-2-line',
    title: '公告',
    description: '这里显示历史公告'
  },
  {
    target: '.ri-refresh-line',
    title: '刷新',
    description: '这里是刷新页面'
  },
  {
    target: '.ri-feedback-line',
    title: '意见反馈',
    description: '这里是意见反馈'
  },
  {
    target: '.top-card-200',
    title: '新增成员',
    description: '这里是团队今天新增的成员数量'
  },
  {
    target: '.top-card-100',
    title: '消耗积分',
    description: '这里是团队今天消耗的积分数量'
  },
  {
    target: '.top-card-1',
    title: '新增美团外卖店铺',
    description: '这里是团队今天新增的美团外卖店铺数量'
  },
  {
    target: '.top-card-2',
    title: '新增饿了么外卖店铺',
    description: '这里是团队今天新增的饿了么外卖店铺数量'
  },
  {
    target: '.home-echart',
    title: '近七日趋势',
    description: '这里是近七天基础数据的走势'
  },
  {
    target: '.todo-card',
    title: '待办事项',
    description: '这里是您设置的待办事项'
  },
  {
    target: '.right-item-pay-top',
    title: '消耗积分数',
    description: '这里是一个月内成员消耗积分的排行'
  },
  {
    target: '.right-item-member-top',
    title: '名下成员数',
    description: '这里是一个月内成员名下子账号数的排行'
  },
  {
    target: '.right-item-shop-top',
    title: '名下店铺数',
    description: '这里是一个月内成员名下店铺数的排行'
  },
  {
    target: '.team-card',
    title: '团队成员',
    description: '这里是团队成员剩余积分数的排行（前十）'
  },
  {
    target: '.update-card',
    title: '更新记录',
    description: '这里是系统更新记录'
  }
])
const openTour = (flag: boolean) => {
  tourState.value = flag
}
onMounted(async () => {
  await refreshDevMockConfig()
  void getData()
  // 订阅 SSE：拿 change 事件做防抖刷新；mode/clear/reset 已在 SSE 内部回写状态
  unsubscribeEvents = subscribeEvents(() => scheduleRefresh(), {
    onSystem: () => scheduleRefresh()
  })
})

onBeforeUnmount(() => {
  if (unsubscribeEvents) unsubscribeEvents()
  if (pendingTimer) clearTimeout(pendingTimer)
})
</script>

<style lang="scss" scoped>
/* 宽屏：内容区最大 1200px + 双列网格；<992px 单列堆叠（不修改 uniapp 手机项目） */
.index-dashboard-shell {
  width: 100%;
  box-sizing: border-box;
  padding: 0 12px;
}

@media (min-width: 992px) {
  .index-dashboard-shell {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 20px;
  }
}

.row-container--metrics {
  margin-bottom: 24px;
}

.index-body-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.index-body-main,
.index-body-aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

@media (min-width: 992px) {
  .index-body-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
    gap: 24px;
    align-items: start;
  }

  .index-body-main,
  .index-body-aside {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.index-container {
  :deep() {
    .el-card {
      .el-card__header {
        position: relative;

        > div > span {
          display: flex;
          align-items: center;

          i {
            margin-right: 3px;
          }
        }
      }

      .el-card__body {
        position: relative;

        .echarts {
          width: 100%;
          height: 186px;
        }

        .card-footer-tag {
          position: absolute;
          right: var(--el-margin);
          bottom: 15px;
        }
      }
    }
  }
}

.top-card-col {
  transition: transform 0.18s ease;
}
.top-card-col.clickable {
  cursor: pointer;
}
.top-card-col.clickable:hover {
  transform: translateY(-3px);
}
.top-card-col.clickable:hover :deep(.top-card) {
  box-shadow: 0 8px 24px rgba(28, 28, 40, 0.1) !important;
}
</style>
