<template>
  <div class="page-container">
    <div class="interbox">
      <div class="jfbox">
        <img alt="" src="/@/assets/group_images/interimg.png">
        <div class="jfnum">
          <div>剩余积分</div>
          <div :class="{ 'blur-text': demoMode }" style="font-size: 18px;font-weight: 600">{{ formatBalance(balance) }}</div>
        </div>
        <el-button type="primary" @click="distribution">分配积分</el-button>
        <!-- <el-button type="primary" @click="changefromold">从小叮当转入</el-button> -->
      </div>
    </div>
    <div class="homecont" style="margin-top:10px;">
      <div class="contenbox">
        <el-table v-loading="tableLoading" :data="tableData" height="calc(100vh - 320px)">
          <el-table-column label="时间" prop="operate_time" width="200">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ row.operate_time || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="消费类型" prop="msg" width="200">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ row.msg || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="积分" prop="val" width="120">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ formatBalance(row.val) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="消费详情" prop="why">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ row.why || '-' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="剩余积分" prop="new_balance" width="120">
            <template #default="{ row }">
              <div :class="{ 'blur-text': demoMode }">{{ formatBalance(row.new_balance) }}</div>
            </template>
          </el-table-column>
        </el-table>
        <vab-pagination :current-page="queryParams.page" :page-size="queryParams.pageSize" :total="total"
          @current-change="handleCurrentChange" @size-change="handleSizeChange" />
      </div>
    </div>
    <el-dialog v-model="jfdioal" :destroy-on-close="true" title="分配积分" width="500px">
      <div class="jifenbox">
        <el-form ref="ruleFormRef" class="demo-ruleForm" label-width="100" :model="form" :rules="rules">
          <el-form-item label="对方用户ID" prop="userId">
            <el-input v-model="form.userId" />
          </el-form-item>
          <el-form-item label="分配积分" prop="giveVal">
            <el-input v-model="form.giveVal" />
          </el-form-item>
          <el-form-item>
            <div style="width: 100%;display: flex;justify-content: flex-end">
              <el-button :loading="btnLoading" type="primary" @click="sumjfen">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { changefromold_http, getLogBalance, giveIntegral } from '/@/api/group.ts'
import type { TableInstance } from 'element-plus'
import { getUserInfo } from '/@/api/user.ts'
import { gp } from '/@vab/plugins/vab.ts'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '/@/store/modules/settings'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const balance = ref(0)
const tableData = ref([])
const total = ref(0)
const jfdioal = ref(false)
const tableLoading = ref(false)
const btnLoading = ref(false)
const ruleFormRef = ref<TableInstance>()
const rules = {
  userId: [
    { required: true, message: '请输入对方用户ID', trigger: 'blur' },
  ],
  giveVal: [
    { required: true, message: '请输入分配积分', trigger: 'blur' },
  ],
}
const queryParams = reactive({
  page: 1,
  pageSize: 20,
})
const form = reactive({
  userId: '',
  giveVal: '',
})
const distribution = () => {
  jfdioal.value = true
}
const changefromold = () => {

  //changefromold
  ElMessageBox.confirm(
    '此操作将从您原来"小叮当"的积分转入到您当前账户下, 转入成功后,您在"小叮当" 中的余额将被清零,请确认是否继续操作?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      changefromold_http().then((res: any) => {
        if (res.code === 200) {
          ElMessage({
            type: 'success',
            message: '转移成功',
          })
          queryParams.page = 1
          getTableData()
          getPageData()
          form.userId = '';
          form.giveVal = ''
        }
        btnLoading.value = false
        jfdioal.value = false
      }).finally(() => {
        btnLoading.value = false
        jfdioal.value = false
      });
    })

}
const getTableData = () => {
  tableLoading.value = true
  getLogBalance(queryParams).then((res: any) => {
    if (res.code === 200) {
      tableData.value = res.data.rows
      total.value = res.data.total
    }
  }).finally(() => {
    tableLoading.value = false
  })
}
const getPageData = async () => {
  try {
    tableLoading.value = true
    const res: any = await getLogBalance(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.rows
      total.value = res.data.total
    }
    const res1: any = await getUserInfo()
    if (res1.code === 200) {
      balance.value = res1.data.admin && res1.data.admin.balance || 0;
    }
  } finally {
    tableLoading.value = false
  }
}
const handleCurrentChange = (value: number) => {
  queryParams.page = value
  getTableData()
}
const handleSizeChange = (value: number) => {
  queryParams.page = 1
  queryParams.pageSize = value
  getTableData()
}
const formatBalance = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  // 如果是整数，不显示小数位
  if (Number.isInteger(num)) {
    return num.toString()
  }
  // 否则保留一位小数
  return num.toFixed(1)
}
const sumjfen = () => {
  if (ruleFormRef.value)
    ruleFormRef.value?.validate(async (valid: any) => {
      if (valid) {
        btnLoading.value = true
        giveIntegral(form).then((res: any) => {
          if (res.code === 200) {
            gp.$baseMessage('分配成功', 'success', 'hey')
            queryParams.page = 1
            getTableData()
            getPageData()
            form.userId = '';
            form.giveVal = ''
          }
          btnLoading.value = false
          jfdioal.value = false
        }).finally(() => {
          btnLoading.value = false
          jfdioal.value = false
        })
      }
    })
}
getPageData()
</script>
<style scoped lang="scss">
.interbox {
  background: #fff;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666666;
  padding: 0 20px;
  box-sizing: border-box;
  justify-content: space-between;


  .jfbox {
    display: flex;
    align-items: center;
    height: 100%;

    img {
      width: 50px;
      height: 50px;
    }

    .addmdbut {
      width: 100px;
      height: 35px;
      // line-height: 30px;
      background: #fe0000;
      color: #fff;
      border-radius: 6px;
      border: none;
    }

    .jfnum {
      margin: 0 20px;

      >p:nth-of-type(2) {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
}

.jifenbox {
  padding-bottom: 20px;
}

.blur-text {
  filter: blur(3px);
  user-select: none;
}
</style>