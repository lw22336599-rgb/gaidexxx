<template>
  <div class="row-cell">
    <el-collapse accordion>
      <el-collapse-item v-for="(item, index) in collapseList" :key="index" :name="index + '1'">
        <template #title>
          <div class="tg-item-title">
            <div style="width: 140px; text-align: left">
              <span v-if="index < 10">0</span>{{ index }}:00-<span v-if="index < 9">0</span>{{ index + 1 }}:00
            </div>
            <div>{{ getMaxPrice(item) }}</div>
          </div>
        </template>
        <div class="tg-list">
          <div v-for="(_item, _index) in item" :key="_index" class="tg-item">
            <div class="item-left">{{ _item.TimeRange.Start }} - {{ _item.TimeRange.End }}</div>
            <div class="item-right">
              <el-input-number v-model="_item.end_offer" :min="0" :precision="1" :step="0.1" />
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
  <el-button :loading="saveLoading" style="margin-top: 20px" type="primary" @click="saveSetting"
    >保存自动点金配置</el-button
  >
  <el-table
    v-loading="tableLoading"
    :data="tableList"
    height="calc(100vh - 500px)"
    style="width: 100%; margin-top: 15px"
  >
    <el-table-column label="出价时间" prop="bidding_time" width="180" />
    <el-table-column label="出价金额" prop="val" width="120" align="center" />
    <el-table-column label="出价原因" prop="why" width="180" />
    <!-- <el-table-column label="评价分数" prop="score" width="80"/>
    <el-table-column label="回评结果" prop="pj_rep" width="220"/> -->
  </el-table>
  <!-- <vab-pagination
    :current-page="queryParamsLog.PageIndex"
    :page-size="queryParamsLog.PageSize"
    :total="total"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
  /> -->
</template>

<script setup lang="ts">
import { getConf, getConfLog, setConf } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'

const props = defineProps({
  currentRow: Object
})
const pageLoading = ref(false)
const queryParams = {
  funccode: 'ZDTG',
  shopid: props.currentRow.id
}
const planOffers = ref([])
const dataList = ref([])
const collapseList = ref([])
const saveLoading = ref(false)
const confData = ref({})
const getConfData = async () => {
  try {
    pageLoading.value = true
    const res = await getConf(queryParams)
    if (res.code === 200) {
      confData.value = res.data.conf
      planOffers.value = res.data.conf.AutoAdType_fool.Plan_Offers
      if (planOffers.value.length === 96) {
        planOffers.value.at(-1).TimeRange.End = '23:59:00'
        collapseList.value = groupSlotsIntoHours(planOffers.value)
      } else {
        dataList.value = updateSlotsWithLargeRanges(fullDaySlots, planOffers.value)
        collapseList.value = groupSlotsIntoHours(dataList.value)
      }
      collapseList.value.forEach(group => {
        group.forEach(item => {
          let startParts = item.TimeRange.Start.split(':')
          let endParts = item.TimeRange.End.split(':')
          item.TimeRange.Start = `${startParts[0].padStart(2, '0')}:${startParts[1].padStart(2, '0')}`
          item.TimeRange.End = `${endParts[0].padStart(2, '0')}:${endParts[1].padStart(2, '0')}`
        })
      })
    }
  } finally {
    pageLoading.value = false
  }
}
const groupSlotsIntoHours = slots => {
  const groupedSlots = []
  for (let i = 0; i < slots.length; i += 4) {
    groupedSlots.push(slots.slice(i, i + 4))
  }
  return groupedSlots
}
// 创建一个完整的 24 小时时间段数组
const initializeFullDaySlots = () => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const startHour = hour
      const startMinute = minute
      const endHour = hour + Math.floor((minute + 15) / 60)
      const endMinute = (minute + 15) % 60
      const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`
      const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`
      slots.push({
        TimeRange: {
          StartTime: { Hour: startHour, Minute: startMinute },
          EndTime: { Hour: endHour, Minute: endMinute },
          Start: startTimeStr,
          End: endTimeStr
        },
        end_offer: 0 // 默认值
      })
    }
  }
  return slots
}
const fullDaySlots = initializeFullDaySlots()
// 更新细化时间段的 end_offer 值
const updateSlotsWithLargeRanges = (slots, largeTimeRanges) => {
  slots.forEach(slot => {
    slot.end_offer = 0
    largeTimeRanges.forEach(largeRange => {
      const slotStartMinutes = slot.TimeRange.StartTime.Hour * 60 + slot.TimeRange.StartTime.Minute
      const slotEndMinutes = (slot.TimeRange.EndTime.Hour % 24) * 60 + slot.TimeRange.EndTime.Minute
      const largeStartMinutes = largeRange.TimeRange.StartTime.Hour * 60 + largeRange.TimeRange.StartTime.Minute
      const largeEndMinutes = largeRange.TimeRange.EndTime.Hour * 60 + largeRange.TimeRange.EndTime.Minute
      if (slotStartMinutes >= largeStartMinutes && slotEndMinutes <= largeEndMinutes) {
        slot.end_offer = largeRange.end_offer
      }
      if (
        largeRange.TimeRange.EndTime.Hour === 23 &&
        largeRange.TimeRange.EndTime.Minute >= 59 &&
        slot.TimeRange.End === '24:00:00'
      ) {
        slot.TimeRange.End = '23:59:59'
        slot.TimeRange.EndTime.Hour = 23
        slot.TimeRange.EndTime.Minute = 59
      }
    })
  })
  return slots
}
const getMaxPrice = (row: any) => {
  return Math.max(...row.map(item => item.end_offer))
}
const saveSetting = () => {
  saveLoading.value = true
  const Plan_Offers = []
  collapseList.value.forEach(item => {
    Plan_Offers.push(...item)
  })
  const params = {
    code: 'ZDTG',
    shop: props.currentRow.id,
    ConfObj: {
      AutoAdType: confData.value.AutoAdType,
      AutoAdType_fool: {
        Plan_Offers
      }
    }
  }
  console.log(params, '123456')
  setConf(params)
    .then((res: any) => {
      if (res.code === 200) {
        gp.$baseMessage('设置成功！', 'success', 'hey')
        getConfData()
      }
    })
    .finally(() => {
      saveLoading.value = false
    })
}
getConfData()
const tableLoading = ref(false)
const tableList = ref([])
const total = ref(0)
const queryParamsLog = {
  PageIndex: 1,
  PageSize: 20,
  func_code: 'ZDTG',
  shop: props.currentRow.id
}
const getLogList = async () => {
  tableLoading.value = true
  try {
    const res: any = await getConfLog(queryParamsLog)
    if (res.code === 200) {
      tableList.value = res.data.rows
      total.value = res.data.total
    }
  } finally {
    tableLoading.value = false
  }
}
const handleCurrentChange = (value: number) => {
  queryParamsLog.PageIndex = value
  getLogList()
}
const handleSizeChange = (value: number) => {
  queryParamsLog.PageSize = value
  queryParamsLog.PageIndex = 1
  getLogList()
}
getLogList()
</script>

<style scoped lang="scss">
.node {
  &.expand {
    .arrow {
      transform: rotate(180deg);
    }
  }
}

.btn-item-main {
  position: fixed;
  width: 100%;
  box-sizing: border-box;
  padding: 0 30rpx;
  left: 0;
  bottom: calc(env(safe-area-inset-bottom) + 15px);
  z-index: 100;

  .btn-item {
    background: #f81c3a;
    color: #ffffff;
  }

  .btn-item-back {
    background-color: #ffffff;
    color: #f81c3a;
  }

  .save-btn {
    width: 100%;
    height: 80rpx;
    background: #facc05;
    border-radius: 14rpx;
    font-weight: 500;
    font-size: 34rpx;
    color: #333333;
    line-height: 80rpx;
    text-align: center;
  }

  .is-elm-btn {
    background: #0492fa;
    color: #fff;
  }
}
.row-cell {
  width: 500px;
  height: calc(100vh - 300px);
  overflow-y: scroll;
}
.tg-list {
  .tg-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .item-left {
      line-height: 32px;
      width: 140px;
      box-sizing: border-box;
      padding-left: 20px;
    }
    .item-right {
    }
  }
}
.tg-item-title {
  display: flex;
  align-items: center;
}
</style>
