<template>
  <div class="page-container">
    <!-- <img alt="" class="bg-img" src="/@/assets/shop_images/smartgold1.png"> -->
    <div class="page-main">
      <vab-card>
        <div class="normal-row">
          <div class="row-left">普通消息</div>
          <div class="row-right">
            <el-select
              v-model="confObj.waitSeconds"
              placeholder="Select"
              style="width: 240px"
              @change="saveWaitSeconds"
            >
              <el-option v-for="item in msgOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
        </div>
        <el-divider />
        <div class="normal-row">
          <div class="row-left">
            紧急消息 <span>(一分钟内回复)</span><vab-icon class="logo" icon="questionnaire-line" /><el-tag
              style="margin-left: 10px"
              type="danger"
              >推荐</el-tag
            >
          </div>
          <div class="row-right"><el-switch v-model="defSwitch" disabled /></div>
        </div>
        <div class="seal-container">
          <div class="normal-row">
            <div class="row-left">售前回复</div>
            <div class="row-right"><el-button plain @click="updateSell(sell.after, 0)">修改</el-button></div>
          </div>
          <div v-loading="pageLoading" class="seal-item-main">
            {{ sell.after }}
          </div>
          <div class="seal-tips">
            <vab-icon class="logo" icon="questionnaire-line" />温馨提示：售前内容存在手机号会导致消息无法回复。
          </div>
          <el-divider />
          <div class="normal-row">
            <div class="row-left">售后回复</div>
            <div class="row-right"><el-button plain @click="updateSell(sell.before, 1)">修改</el-button></div>
          </div>
          <div v-loading="pageLoading" class="seal-item-main">
            {{ sell.before }}
          </div>
        </div>
        <p>回复日志</p>
        <!-- height="calc(100vh - 900px)" -->
        <el-table
          v-loading="tableLoading"
          :data="tableList"
          style="width: 100%; margin-top: 15px; min-height: 150px; flex: 1"
        >
          <el-table-column label="回复时间" prop="crtim" width="180" />
          <el-table-column label="回复内容" prop="reply" />
        </el-table>
        <vab-pagination
          :current-page="queryParamsLog.PageIndex"
          :page-size="queryParamsLog.PageSize"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </vab-card>
      <el-dialog v-model="dialogVisible" :before-close="handleClose" title="修改内容" width="500">
        <el-input v-model="textarea" placeholder="请输入内容" :rows="4" type="textarea" />
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleClose">取 消</el-button>
            <el-button :loading="btnLoading" type="primary" @click="saveSetting"> 确认修改 </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getConf, getConfLog, setConf } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'
import type { FormInstance } from 'element-plus'
const props = defineProps({
  currentRow: Object
})
const pageLoading = ref(false)
const btnLoading = ref(false)
const tableLoading = ref(false)
const defSwitch = ref(true)
const textarea = ref('')
const queryParams = {
  funccode: 'IMZDHF',
  shopid: props.currentRow.id
}
const queryParamsLog = {
  PageIndex: 1,
  PageSize: 20,
  func_code: 'IMZDHF',
  shop: props.currentRow.id
}
const dialogVisible = ref(false)
const handleClose = () => {
  dialogVisible.value = false
  textarea.value = ''
}
const currentType = ref(0)
const updateSell = (str: string, num: number) => {
  currentType.value = num
  textarea.value = JSON.parse(JSON.stringify(str))
  dialogVisible.value = true
}
const tableList = ref([])
const total = ref(0)
const sell = reactive({
  after: '',
  before: ''
})
const confObj = ref({})
const getConfData = async () => {
  try {
    pageLoading.value = true
    const res: any = await getConf(queryParams)
    if (res.code === 200) {
      confObj.value = res.data.conf
      sell.after =
        res.data.conf && res.data.conf.content && res.data.conf.content[0] ? res.data.conf.content[0] : '请输入售前回复'
      sell.before =
        res.data.conf && res.data.conf.content && res.data.conf.content[1] ? res.data.conf.content[1] : '请输入售后回复'
    }
  } finally {
    pageLoading.value = false
  }
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
const saveSetting = async () => {
  try {
    btnLoading.value = true
    confObj.value.content[currentType.value] = textarea.value
    const params = {
      ConfObj: confObj.value,
      code: 'IMZDHF',
      shop: props.currentRow.id
    }
    const res: any = await setConf(params)
    if (res.code === 200) {
      gp.$baseMessage('设置成功！', 'success', 'hey')
      dialogVisible.value = false
      await getConfData()
    }
  } finally {
    btnLoading.value = false
  }
}
const saveWaitSeconds = async () => {
  const params = {
    ConfObj: confObj.value,
    code: 'IMZDHF',
    shop: props.currentRow.id
  }
  const res: any = await setConf(params)
  if (res.code === 200) {
    gp.$baseMessage('设置成功！', 'success', 'hey')
    await getConfData()
  }
}
getConfData()
getLogList()
const msgOptions = ref([
  {
    value: 0,
    label: '立即回复'
  },
  {
    value: 10,
    label: '超过10秒未回复的顾客'
  },
  {
    value: 30,
    label: '超过30秒未回复的顾客'
  },
  {
    value: 50,
    label: '超过50秒未回复的顾客'
  },
  {
    value: 120,
    label: '超过2分钟未回复的顾客'
  },
  {
    value: 180,
    label: '超过3分钟未回复的顾客'
  },
  {
    value: 240,
    label: '超过4分钟未回复的顾客'
  }
])
</script>

<style scoped lang="scss">
.page-container {
  position: relative;
  width: 100%;
  height: 100%;
  .page-main {
    width: 100%;
    height: 100%;
    :deep() {
      .el-card {
        width: 100%;
        height: 100%;
        overflow-y: auto;
      }
      .el-card__body {
        width: 100%;
        height: 100%;
        display: flex;
        min-height: fit-content;
        flex-direction: column;
      }
    }
    .normal-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .row-left {
        display: flex;
        align-items: center;
        :deep() {
          .logo {
            margin: 0 0 0 6px;
            font-size: 18px;
          }
        }
      }
      .row-right {
        display: flex;
        align-items: center;
        :deep() {
          .ri-arrow-drop-right-line {
            margin: 0 0 0 6px;
            font-size: 18px;
          }
        }
      }
    }
  }
  .bg-img {
    width: 500px;
    height: auto;
  }
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
.seal-container {
  margin-top: 20px;
  .seal-item-main {
    width: 100%;
    background: var(--el-color-info-light-9);
    box-sizing: border-box;
    padding: 10px;
    margin-top: 5px;
    border-radius: var(--el-border-radius-base);
    line-height: 1.5;
  }
  .seal-tips {
    display: flex;
    align-items: center;
    margin-top: 5px;
    :deep() {
      .logo {
        margin: 0 6px 0 0;
        font-size: 18px;
      }
    }
  }
}
</style>
