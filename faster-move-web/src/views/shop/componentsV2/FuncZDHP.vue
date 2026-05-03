<template>
  <div>
    <div class="tem-container">
      <div class="tem-title"><el-button type="primary" @click="handleOpenTemList">模板管理</el-button></div>
      <div v-loading="pageLoading" class="tem-main">
        <div class="tem-item">
          <div class="tem-item-title">回复时间</div>
          <div class="tem-item-main">
            <div class="tem-lit-item is-tem-lit-item">评价后第二天</div>
            <div class="tem-lit-item is-tem-lit-item">08:00</div>
          </div>
        </div>
        <div class="tem-item">
          <div class="tem-item-title">回复星级</div>
          <div class="tem-item-main">
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.reply_hp }"
              @click="changeReply('reply_hp')"
            >
              好评
            </div>
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.reply_zp }"
              @click="changeReply('reply_zp')"
            >
              中评
            </div>
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.reply_cp }"
              @click="changeReply('reply_cp')"
            >
              差评
            </div>
          </div>
        </div>
        <div class="tem-item">
          <div class="tem-item-title">有无内容</div>
          <div class="tem-item-main">
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.PjStrType === 0 }"
              @click="changeContent(0)"
            >
              全部
            </div>
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.PjStrType === 1 }"
              @click="changeContent(1)"
            >
              有内容
            </div>
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.PjStrType === 2 }"
              @click="changeContent(2)"
            >
              无内容
            </div>
          </div>
        </div>
        <div class="tem-item">
          <div class="tem-item-title">回复模板</div>
          <div class="tem-item-main">
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.UseTemplate === '默认模板' }"
              @click="changeTem('默认模板')"
            >
              默认模板
            </div>
            <div
              class="tem-lit-item"
              :class="{ 'is-tem-lit-item': confData.UseTemplate !== '默认模板' }"
              @click="changeTem('请选择模板')"
            >
              自定义模板
            </div>
            <el-select
              v-if="confData.UseTemplate !== '默认模板'"
              v-model="confData.UseTemplate"
              placeholder="Select"
              style="width: 120px"
            >
              <el-option
                v-for="item in confData.ConfTemplate"
                :key="item.Name"
                :disabled="item.Name === '默认模板'"
                :label="item.Name"
                :value="item.Name"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="temListState" :before-close="handleCloseTemList" title="模板管理" width="600">
      <div>
        <div class="tem-title"><el-button type="primary" @click="addTem">添加模板</el-button></div>
        <el-table
          v-loading="temLoading"
          :data="confData.ConfTemplate"
          style="width: 100%; max-height: 500px; margin-top: 15px"
        >
          <el-table-column label="模板名称" prop="Name" />
          <el-table-column label="操作" width="170">
            <template #default="{ row, $index }">
              <el-button v-if="row.Name !== '默认模板'" type="primary" @click="editTem(row, $index)">编辑</el-button>
              <el-button v-if="row.Name !== '默认模板'" type="danger" @click="delTem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseTemList">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editTemState" :before-close="handleCloseEdit" title="模板管理" width="600">
      <div>
        <div class="tem-list-title" style="margin-bottom: 20px">
          模板名称：<el-input v-model="currentEditTem.Name" placeholder="请输入模板名称" />
        </div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="好评模板" name="好评模板">
            <div class="talk-list">
              <el-button type="primary" @click="addTemTalkItem('reply_hp_strList')">添加话术</el-button>
              <div v-for="(item, index) in currentEditTem.reply_hp_strList" :key="index" class="talk-item">
                <el-input
                  v-model="currentEditTem.reply_hp_strList[index]"
                  class="talk-item-input"
                  placeholder="请输入模板名称"
                />
                <vab-icon
                  v-if="index !== 0"
                  class="talk-icon"
                  icon="delete-bin-6-fill"
                  @click="delTemTalkItem('reply_hp_strList', index)"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="中评模板" name="中评模板">
            <div class="talk-list">
              <el-button type="primary" @click="addTemTalkItem('reply_zp_strList')">添加话术</el-button>
              <div v-for="(item, index) in currentEditTem.reply_zp_strList" :key="index" class="talk-item">
                <el-input
                  v-model="currentEditTem.reply_zp_strList[index]"
                  class="talk-item-input"
                  placeholder="请输入模板名称"
                />
                <vab-icon
                  v-if="index !== 0"
                  class="talk-icon"
                  icon="delete-bin-6-fill"
                  @click="delTemTalkItem('reply_zp_strList', index)"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="差评模板" name="差评模板">
            <div class="talk-list">
              <el-button type="primary" @click="addTemTalkItem('reply_cp_strList')">添加话术</el-button>
              <div v-for="(item, index) in currentEditTem.reply_cp_strList" :key="index" class="talk-item">
                <el-input
                  v-model="currentEditTem.reply_cp_strList[index]"
                  class="talk-item-input"
                  placeholder="请输入模板名称"
                />
                <vab-icon
                  v-if="index !== 0"
                  class="talk-icon"
                  icon="delete-bin-6-fill"
                  @click="delTemTalkItem('reply_cp_strList', index)"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEdit">关闭</el-button>
          <el-button :loading="saveTemTalkLoading" type="primary" @click="saveTemTalk">保存</el-button>
        </div>
      </template>
    </el-dialog>
    <el-button :loading="saveLoading" style="margin-top: 10px" type="primary" @click="saveSetting"
      >保存回评配置</el-button
    >
    <el-table
      v-loading="tableLoading"
      :data="tableList"
      height="calc(100vh - 500px)"
      style="width: 100%; margin-top: 15px"
    >
      <el-table-column label="评价时间" prop="pj_time" width="160" />
      <el-table-column label="评价类型" prop="pj_type" width="100">
        <template #default="{ row }">
          <div>{{ row.pj_type == 1 ? '好评' : row.pj_type == 2 ? '中评' : '差评' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="评价内容" prop="pj_str" width="180" />
      <el-table-column label="评价分数" prop="score" width="100" />
      <el-table-column label="回评结果" prop="pj_rep" width="220" />
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
import { ElMessageBox } from 'element-plus'
const props = defineProps({
  currentRow: Object
})
const pageLoading = ref(false)
const tableLoading = ref(false)
const saveLoading = ref(false)
const temListState = ref(false)
const editTemState = ref(false)
const temLoading = ref(false)
const activeName = ref('好评模板')
const currentEditTem = ref<any>({})
const currentEditIndex = ref(0)
const queryParams = {
  funccode: 'ZDHP',
  shopid: props.currentRow.id
}
const queryParamsLog = {
  PageIndex: 1,
  PageSize: 20,
  func_code: 'ZDHP',
  shop: props.currentRow.id
}
const tableList = ref([])
const total = ref(0)
const confData = ref<any>({})
const getConfData = async () => {
  try {
    pageLoading.value = true
    const res: any = await getConf(queryParams)
    if (res.code === 200) {
      confData.value = res.data.conf
      confParams.ConfObj = confData.value
    }
  } finally {
    pageLoading.value = false
  }
}
const handleCloseTemList = () => {
  temListState.value = false
}
const handleCloseEdit = () => {
  editTemState.value = false
}
const addTemTalkItem = str => {
  currentEditTem.value[str].push('请输入内容')
}
const delTemTalkItem = (str, index) => {
  currentEditTem.value[str].splice(index, 1)
}
const saveTemTalkLoading = ref(false)
const saveTemTalk = async () => {
  saveTemTalkLoading.value = true
  confData.value.ConfTemplate[currentEditIndex.value] = currentEditTem.value
  try {
    await setConfData()
  } finally {
    saveTemTalkLoading.value = false
  }
}
const handleOpenTemList = () => {
  temListState.value = true
}
const changeContent = (num: number) => {
  confData.value.PjStrType = num
}
const changeTem = (str: string) => {
  confData.value.UseTemplate = str
}
const changeReply = (str: any) => {
  confData.value[str] = !confData.value[str]
}
const confParams = reactive({
  ConfObj: {},
  code: 'ZDHP',
  shop: props.currentRow.id
})
const editTem = (row: any, index: number) => {
  currentEditTem.value = row
  currentEditIndex.value = index
  editTemState.value = true
}
const delTem = async (row: any) => {
  confData.value.ConfTemplate = confData.value.ConfTemplate.filter((item: any) => item.Name !== row.Name)
  await setConfData()
}
const addTem = () => {
  ElMessageBox.prompt('请输入模板名称', '添加模板', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    inputPattern: /\S+/,
    inputErrorMessage: '请输入模板名称'
  })
    .then(async ({ value }) => {
      if (confData.value.ConfTemplate.filter((item: any) => item.Name === value).length === 0) {
        confData.value.ConfTemplate.push({
          Name: value,
          reply_cp_strList: [
            '尊敬的顾客，我们对您此次用餐体验的不满感到非常抱歉，期待您的再次光临，让我们有机会弥补这次的不足。'
          ],
          reply_hp_strList: [
            '感谢您的五星好评，就像您对我们菜品的喜爱一样，我们对您的满意也充满了感激！期待再次为您服务'
          ],
          reply_zp_strList: [
            '尊敬的顾客，感谢您的宝贵意见。我们深感遗憾未能完全满足您的期望，期待您的再次光临，让我们有机会弥补不足。'
          ]
        })
        await setConfData()
      } else {
        gp.$baseMessage('模版名称已存在,请更换一个！', 'error', 'hey')
      }
    })
    .catch(() => {})
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
  if (confData.value.UseTemplate === '请选择模板') {
    return gp.$baseMessage('请选择模板！', 'error', 'hey')
  }
  try {
    pageLoading.value = true
    saveLoading.value = true
    // 模板列表中无模板，自动补齐默认模板
    if (!confData.value.ConfTemplate || confData.value.ConfTemplate.length === 0) {
      confData.value.ConfTemplate = []
      confData.value.ConfTemplate.push({
        Name: '默认模板',
        reply_cp_strList: confData.value.reply_cp_strList,
        reply_hp_strList: confData.value.reply_hp_strList,
        reply_zp_strList: confData.value.reply_zp_strList
      })
    }
    await setConfData()
  } finally {
    pageLoading.value = false
    saveLoading.value = false
  }
}
const setConfData = async () => {
  const res: any = await setConf(confParams)
  if (res.code === 200) {
    gp.$baseMessage('设置成功！', 'success', 'hey')
    handleCloseEdit()
    await getConfData()
  }
}
getConfData()
getLogList()
</script>

<style scoped lang="scss">
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
  .page-left {
    width: 100px;
    line-height: 32px;
  }
  .page-right {
    width: calc(100% - 100px);
    :deep() {
      .form-item {
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
.tem-container {
  width: 100%;
  padding: 0 12px;
  .tem-title {
    margin-bottom: 10px;
  }
  .tem-main {
    .tem-item {
      display: flex;
      align-content: center;
      margin-bottom: 8px;
      .tem-item-title {
        line-height: 32px;
        width: 120px;
      }
      .tem-item-main {
        display: flex;
        align-content: center;
        .tem-lit-item {
          width: 120px;
          border-radius: var(--el-border-radius-base);
          margin-right: 8px;
          border: var(--el-border);
          line-height: 30px;
          cursor: pointer;
          text-align: center;
          box-sizing: border-box;
        }
        .is-tem-lit-item {
          border-color: #e02020;
        }
      }
    }
  }
}
.talk-item {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  .talk-item-input {
    width: calc(100% - 24px);
  }
  .talk-icon {
    width: 24px;
  }
}
.tem-list-title {
  display: flex;
  align-content: center;
  line-height: 32px;
  width: 100%;
  :deep() {
    .el-input {
      width: calc(100% - 100px);
    }
  }
}
</style>
