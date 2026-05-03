<template>
  <div class="pagefuncbox">
    <div class="page-tips">
      当前普通时段承诺防漏单时长：{{ foodCount.expected }}分钟<vab-icon class="logo" icon="questionnaire-line" />
    </div>
    <div class="page-main">
      <div class="page-left">防漏单设置</div>
      <div v-loading="pageLoading" class="page-right">
        <el-form ref="mbObjRef" class="demo-ruleForm" label-width="120px" :model="mbObj" :rules="mbRules">
          <el-form-item class="form-item" label="正常防漏单" prop="zhengcc">
            <el-input v-model="mbObj.zhengcc" type="number" />
            分钟
          </el-form-item>
          <el-form-item v-if="props.currentRow.shop_type === 1" class="form-item" label="预定单" prop="ydd">
            <el-input v-model="mbObj.ydd" type="number" />
            分钟
          </el-form-item>
          <el-form-item class="form-item" label="午高峰期" prop="wugf">
            <el-input v-model="mbObj.wugf" type="number" />
            分钟<span>（11点-13点）</span>
          </el-form-item>
          <el-form-item class="form-item" label="晚高峰期" prop="wangf">
            <el-input v-model="mbObj.wangf" type="number" />
            分钟<span>（18点-20点）</span>
          </el-form-item>
          <el-form-item class="form-item" label="宵夜档期" prop="yx">
            <el-input v-model="mbObj.yx" type="number" />
            分钟<span>（21点-24点）</span>
          </el-form-item>
          <el-form-item class="form-item" label="中额订单" prop="ze">
            <el-input v-model="mbObj.ze" type="number" />
            分钟<span>（订单金额大于50且小于100）</span>
          </el-form-item>
          <el-form-item class="form-item" label="大额订单" prop="de">
            <el-input v-model="mbObj.de" type="number" />
            分钟<span>（订单金额大于100）</span>
          </el-form-item>
          <el-form-item class="form-item" label="自配送订单" prop="zps">
            <el-input v-model="mbObj.zps" type="number" />
            分钟
          </el-form-item>
        </el-form>
        <el-button style="margin-top: 10px" type="primary" @click="saveSetting">保存防漏单配置</el-button>
      </div>
    </div>
    <div class="page-tips" style="margin-top: 20px">防漏单日志：</div>
    <!-- <div class="page-tips" style="margin-top: 20px;">今日防漏单：{{ foodCount.finished }}/{{ foodCount.unFinished }}</div> -->
    <!-- height="calc(100vh - 780px)" -->
    <el-table
      v-loading="tableLoading"
      :data="tableList"
      style="width: 100%; margin-top: 15px; flex: 1; min-height: 190px"
    >
      <el-table-column label="订单序号" prop="dayseq" width="120" />
      <el-table-column label="防漏单用时" width="120">
        <template #default="{ row }">
          <div>{{ getTime(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="防漏单时间" prop="out_endTime" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <div v-if="row.state === 2">保卫成功 <span v-if="row === 2">（预订单）</span></div>
          <div v-if="row.state === 3">保卫失败</div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="原因" width="160">
      <template #default="{row}">
        <div v-if="row.state === 3">{{ row.msg }}</div>
      </template>
    </el-table-column> -->
    </el-table>
    <vab-pagination
      :current-page="queryParamsLog.PageIndex"
      :page-size="queryParamsLog.PageSize"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { getConf, getConfLog, setConf } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'
import type { FormInstance, FormRules } from 'element-plus'
const props = defineProps({
  currentRow: Object
})
const pageLoading = ref(false)
const tableLoading = ref(false)
const foodCount = reactive({
  expected: 6, // 接口没返回情况下默认6分钟
  finished: 0,
  unFinished: 0
})
const mbObj = reactive({
  zhengcc: 0,
  ydd: 0,
  wugf: 0,
  wangf: 0,
  yx: 0,
  ze: 0,
  de: 0,
  zps: 0
})
const mbRules = reactive<FormRules<FormType>>({
  zhengcc: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入正常防漏单时长'
    }
  ],
  ydd: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入预定单时长'
    }
  ],
  wugf: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入午高峰期时长'
    }
  ],
  wangf: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入晚高峰期时长'
    }
  ],
  yx: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入宵夜档期时长'
    }
  ],
  ze: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入中额订单时长'
    }
  ],
  de: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入大额订单时长'
    }
  ],
  zps: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入自配送订单时长'
    }
  ]
})
const queryParams = {
  funccode: 'ZDCC',
  shopid: props.currentRow.id
}
const queryParamsLog = {
  PageIndex: 1,
  PageSize: 20,
  func_code: 'ZDCC',
  shop: props.currentRow.id
}
const order = ['正常出餐', '午高峰出餐', '晚高峰期', '夜宵档期', '中额订单', '大额订单', '自配送订单', '预定单出餐']
// const order = ['正常出餐', '午高峰期', '晚高峰期', '夜宵档期', '中额订单时间', '大额订单时间', '自配送时间', '预定单出餐']
const confTem = ref([])
const keyMapping = {
  正常出餐: 'zhengcc',
  午高峰出餐: 'wugf',
  晚高峰期: 'wangf',
  夜宵档期: 'yx',
  中额订单: 'ze',
  大额订单: 'de',
  自配送订单: 'zps',
  预定单出餐: 'ydd'
}
const settingConf = reactive({
  ConfTemplate: [],
  UseTemplate: ''
})
const mbObjRef = ref<FormInstance>()
const tableList = ref([])
const total = ref(0)
const getConfData = async () => {
  try {
    pageLoading.value = true
    const res = await getConf(queryParams)
    if (res.code === 200) {
      settingConf.ConfTemplate = res.data.conf.ConfTemplate
      settingConf.UseTemplate = res.data.conf.UseTemplate || '默认模板'
      if (res.data.conf.UseTemplate && res.data.conf.UseTemplate == res.data.conf.ConfTemplate[0].Name) {
        confTem.value = res.data.conf.ConfTemplate[0].Conf_Time as Array<any>
        let DefaultConf = res.data.conf.ConfTemplate[0].DefaultConf as object
        DefaultConf.title = '正常防漏单'
        confTem.value.unshift(DefaultConf)
      } else {
        // let data=[{title: "中额订单时间", WaitSecond: 0, StartHour: -1, EndHour: -1},
        // {title: "大额订单时间", WaitSecond: 0, StartHour: -1, EndHour: -1},
        // {title: "自配送时间", WaitSecond: 0, StartHour: -1, EndHour: -1}]
        let data = res.data.conf.ConfTemplate[0].Conf_Time as Array<any>
        let indexoflist = ['午高峰', '晚高峰', '夜宵', '中额订单', '大额订单', '自配送', '预定单']
        confTem.value = res.data.conf.Conf_Time as Array<any>
        let conarr = []
        indexoflist.map(item => {
          conarr = res.data.conf.Conf_Time.filter(conitem => conitem.title.indexOf(item) != -1)
          let dataarr = data.filter(conitem => conitem.title.indexOf(item) != -1)
          dataarr[0].WaitSecon = 0
          if (conarr.length == 0) {
            confTem.value.push(dataarr[0])
          }
        })
        let DefaultConf = res.data.conf.DefaultConf
        DefaultConf.title = '正常防漏单'
        confTem.value.unshift(DefaultConf)
      }

      order.forEach(title => {
        let indexoflist = ['正常', '午高峰', '晚高峰', '夜宵', '中额订单', '大额订单', '自配送', '预定单']
        let text = indexoflist.find(item => title.indexOf(item) != -1)
        const item = confTem.value.find(item => item.title.indexOf(text) != -1)
        if (item) {
          const mappedKey = keyMapping[title]
          if (mappedKey) {
            mbObj[mappedKey] = Math.floor(item.WaitSecond / 60)
          }
        }
      })
      console.log(mbObj, 'mbObj')
      foodCount.expected =
        res.data.site_set &&
        res.data.site_set.PromiseTime &&
        res.data.site_set.PromiseTime.length > 0 &&
        res.data.site_set.PromiseTime[0].WaitSecond
          ? res.data.site_set.PromiseTime[0].WaitSecond / 60
          : 0
      foodCount.finished = res.data.count_has_out
      foodCount.unFinished = res.data.count_wait_out
    }
  } finally {
    pageLoading.value = false
  }
}
const getLogList = async () => {
  tableLoading.value = true
  try {
    const res = await getConfLog(queryParamsLog)
    if (res.code === 200) {
      tableList.value = res.data.rows.filter((item: any) => item.state === 2 || item.state === 3)
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
const saveSetting = async () => {
  if (mbObjRef.value)
    mbObjRef.value?.validate(async (valid: any) => {
      if (valid)
        try {
          pageLoading.value = true
          settingConf.ConfTemplate[0].DefaultConf = Object.assign({}, confTem.value[0], {
            WaitSecond: Number(mbObj['zhengcc']) * 60
          })
          let Conf_Time = confTem.value.slice(1)
          Conf_Time = Conf_Time.map((item: any) => {
            let indexoflist = ['正常', '午高峰', '晚高峰', '夜宵', '中额订单', '大额订单', '自配送', '预定单']
            let incl = indexoflist.filter(initem => item.title.includes(initem))
            let mappedKey = null
            if (incl.length) {
              for (let key in keyMapping) {
                if (key.includes(incl[0])) {
                  mappedKey = keyMapping[key]
                }
              }
            }
            // mappedKey = keyMapping[item.title];

            if (mappedKey && mbObj[mappedKey] !== undefined) {
              const waitMinutes = Number(mbObj[mappedKey])
              item.WaitSecond = isNaN(waitMinutes) ? item.WaitSecond : waitMinutes * 60
            }
            return item
          })
          // console.log(Conf_Time,'Conf_Time',mbObj);
          // return ;
          let indexoflist = ['午高峰', '晚高峰', '夜宵', '中额订单', '大额订单', '自配送', '预定单']
          let trueindex = [
            '午高峰出餐',
            '晚高峰出餐',
            '夜宵档期出餐',
            '中额订单时间',
            '大额订单时间',
            '自配送时间',
            '预定单出餐'
          ]
          Conf_Time = Conf_Time.map(conitem => {
            indexoflist.map((item, index) => {
              if (conitem.title.indexOf(item) != -1) {
                conitem.title = trueindex[index]
              }
            })
            return conitem
          })
          settingConf.ConfTemplate[0].Conf_Time = Conf_Time
          settingConf.ConfTemplate[0].Name = settingConf.UseTemplate
          const params = {
            ConfObj: settingConf,
            code: 'ZDCC',
            shop: props.currentRow.id
          }
          // console.log(params,'params');
          // return;

          const res = await setConf(params)
          if (res.code === 200) {
            gp.$baseMessage('设置成功！', 'success', 'hey')
            await getConfData()
          }
        } finally {
          pageLoading.value = false
        }
    })
}
const getTime = (row: string) => {
  const endTime = new Date(row.out_endTime)
  const startTime = new Date(row.order_time)
  const diffInMilliseconds = endTime - startTime
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
  const remainingSeconds = Math.round((diffInMilliseconds % (1000 * 60)) / 1000)
  return `${diffInMinutes} 分 ${remainingSeconds} 秒`
}
getConfData()
getLogList()
</script>

<style scoped lang="scss">
.pagefuncbox {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  // min-height: fit-content;
}
.page-tips {
  width: 100%;
  display: flex;
  align-items: center;
  :deep() {
    .logo {
      margin: 0 0 0 6px;
      font-size: 18px;
    }
  }
}
.page-main {
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  flex-direction: column;
  // flex: 1;
  // overflow: hidden;
  .page-left {
    width: 100px;
    line-height: 32px;
  }
  .page-right {
    // flex: 1;
    width: calc(100% - 100px);
    :deep() {
      .form-item {
        margin-bottom: 10px;
        .el-form-item__content {
          width: calc(100% - 100px);
          display: flex;
          align-items: center;
          .el-input {
            width: 80px;
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
