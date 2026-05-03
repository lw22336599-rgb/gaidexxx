<template>
  <div class="index-container no-background-container">
    <el-row :gutter="20" class="row-container">

      <el-col v-for="item in topData" :key="item.key" :span="5">
        <top-card background="white" :count-config="item" percentage="10%" :title="item.title" />
      </el-col>
      <el-col v-if="weather && weather.describe" :span="5">
        <weather-card :config="weather" />
      </el-col>
      <el-col :lg="18" :md="24" :sm="24" :xl="18" :xs="24">
        <home-echart :add-num="addNum" :centre="centre" :integral="integral" :prov="prov" :x-axis-data="xAxisData"
          :jd-data="JdData" @open-tour="openTour" />
        <account-data :month-member-data="monthMemberData" />
      </el-col>
      <el-col :lg="6" :md="24" :sm="24" :xl="6" :xs="24">
        <todo-list :todo-data="todoData" />
        <team-list :team-top-list="teamTopList" />
        <update-log :update-top="updateTop" />
      </el-col>
    </el-row>
    <el-tour v-model="tourState" :type="type">
      <el-tour-step v-for="step in steps" :key="step" :description="step.description" :target="step.target"
        :title="step.title" />
    </el-tour>
  </div>
</template>

<script lang="ts" setup>
import { getHomeData, getListOrderByCtime } from '/@/api/business.ts'
import AccountData from "/@/views/index/accountData.vue";
import HomeEchart from "/@/views/index/homeEchart.vue";
import UpdateLog from "/@/views/index/updateLog.vue";
import TeamList from "/src/views/index/teamList.vue";
import TodoList from "/@/views/index/todoList.vue";
defineOptions({
  name: 'Index',
})

const homeData = ref<any>({})
const topData = ref<any>([])
const weather = ref<any>({})
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
  await getHomeData().then((res: any) => {
    if (res.code === 200) {
      homeData.value = res.data
      topData.value = res.data.top_data
      weather.value = res.data.weather
      topData.value = Object.keys(topData.value).map(key => ({
        key,
        startValue: 0,
        decimals: 0,
        prefix: '',
        suffix: '',
        separator: ',',
        duration: 8000,
        ...topData.value[key]
      }));
      topData.value.forEach((item: any) => { item.count = Math.abs(item.count) })
      weather.value.date = getWeatherTime()
      lastWeek.value = res.data.last_week
      for (let key in lastWeek.value) {
        xAxisData.value.push(key)
        centre.value.push(lastWeek.value[key]['美团店铺'])
        prov.value.push(lastWeek.value[key]['饿了么店铺'])
        addNum.value.push(lastWeek.value[key]['新增成员'])
        JdData.value.push(lastWeek.value[key]['京东到家'])
        integral.value.push(lastWeek.value[key]['积分消耗'] ? Math.abs(lastWeek.value[key]['积分消耗']) : 0)
      }
      monthMemberData.payTop = res.data.month_pay_member || []
      monthMemberData.memberTop = res.data.month_member_count || []
      monthMemberData.shopTop = res.data.month_shop_count || []
      todoData.done = res.data.calendar_count.done
      todoData.undone = res.data.calendar_count.undone
      teamTopList.value.push(...res.data.BalanceTop)
      updateTop.value.push(...res.data.update_top10)
      updateTop.value.forEach((item: any) => {
        item.content = item.content.replaceAll('\n', '<br>')
      })

    }
  })
}


const getWeatherTime = () => {
  const date = weather.value.uptime && new Date(weather.value.uptime) || new Date();
  const time = [
    date.toLocaleDateString(),
    [date.getHours(), date.getMinutes()].join(':'),
    '星期'.concat('日 一 二 三 四 五 六'.split(' ')[date.getDay()])
  ];
  return time.join(" ");
}
const type = ref<any>('primary')
const tourState = ref<boolean>(false)
const steps = ref<any>([
  {
    target: '.vab-dark',
    title: '暗黑模式',
    description: '这里是暗黑模式切换',
  },
  {
    target: '.ri-font-size-2',
    title: '字体大小',
    description: '这里是改变字体大小',
  },
  {
    target: '.ri-notification-2-line',
    title: '公告',
    description: '这里显示历史公告',
  },
  {
    target: '.ri-refresh-line',
    title: '刷新',
    description: '这里是刷新页面',
  },
  {
    target: '.ri-feedback-line',
    title: '意见反馈',
    description: '这里是意见反馈',
  },
  {
    target: '.top-card-200',
    title: '新增成员',
    description: '这里是团队今天新增的成员数量',
  },
  {
    target: '.top-card-100',
    title: '消耗积分',
    description: '这里是团队今天消耗的积分数量',
  },
  {
    target: '.top-card-1',
    title: '新增美团外卖店铺',
    description: '这里是团队今天新增的美团外卖店铺数量',
  },
  {
    target: '.top-card-2',
    title: '新增饿了么外卖店铺',
    description: '这里是团队今天新增的饿了么外卖店铺数量',
  },
  {
    target: '.weather-top-card',
    title: '天气',
    description: '这里是您当前所在城市的天气及温度',
  },
  {
    target: '.home-echart',
    title: '近七日趋势',
    description: '这里是近七天基础数据的走势',
  },
  {
    target: '.todo-card',
    title: '待办事项',
    description: '这里是您设置的待办事项',
  },
  {
    target: '.right-item-pay-top',
    title: '消耗积分数',
    description: '这里是一个月内成员消耗积分的排行',
  },
  {
    target: '.right-item-member-top',
    title: '名下成员数',
    description: '这里是一个月内成员名下子账号数的排行',
  },
  {
    target: '.right-item-shop-top',
    title: '名下店铺数',
    description: '这里是一个月内成员名下店铺数的排行',
  },
  {
    target: '.team-card',
    title: '团队成员',
    description: '这里是团队成员剩余积分数的排行（前十）',
  },
  {
    target: '.update-card',
    title: '更新记录',
    description: '这里是系统更新记录'
  },
])
const openTour = (flag: boolean) => {
  tourState.value = flag
}
onMounted(() => {
  getData()
})
</script>

<style lang="scss" scoped>
.index-container {
  :deep() {
    .el-card {
      .el-card__header {
        position: relative;

        >div>span {
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

.row-container {
  :deep() {
    .el-col-5 {
      max-width: 20%;
      flex: 0 0 20%;
    }
  }
}
</style>
