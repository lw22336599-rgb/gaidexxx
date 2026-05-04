<template>
  <el-dialog v-model="visible" title="批量更新推送配置" width="700px" :before-close="handleClose" destroy-on-close>
    <div class="batch-config-content">
      <div class="shop-count">共 {{ props.shopList.length }} 家店铺</div>
      <div class="config-form">
        <div>推送内容设置：</div>
        <div class="tscont">
          <div v-for="item in tipslist" :key="item.name" class="caritem">
            <div class="carttop">
              <div>
                <div style="font-size: var(--el-font-size-base)">{{ item.name }}</div>
                <div v-if="item.name == '门店经营日报'" class="tstime">
                  推送时间：<el-time-select
                    v-model="timetxet"
                    style="width: 140px"
                    start="06:00"
                    step="01:00"
                    end="20:00"
                  />
                </div>
                <div v-if="item.name == '推广异常提醒'" class="tstime">
                  推广金额低于：<el-input v-model="MinAdBalance" style="width: 60px" />元提醒
                </div>
              </div>
              <div class="carttips">
                <el-switch v-model="item.Enable" class="ml-2" />
                <div
                  v-if="item.name == '门店经营日报'"
                  style="
                    color: var(--el-color-primary);
                    cursor: pointer;
                    font-size: var(--el-font-size-base);
                    margin-top: 8px;
                  "
                  @click="rbwechatVisible = true"
                >
                  数据设置
                </div>
              </div>
            </div>
            <div style="font-size: var(--el-font-size-base)">{{ item.text }}</div>
          </div>
        </div>
        <div class="inpulist">
          <el-checkbox v-model="checkedtop" size="large" />
          <div style="margin: 0 5px">为提醒内容加上前缀：</div>
          <el-input v-model="PushStrFirst" style="width: 400px; margin-right: 5px" />
        </div>
        <div class="inpulist">
          <el-checkbox v-model="checkedlow" size="large" />
          <div style="margin: 0 5px">为提醒内容加上后缀：</div>
          <el-input v-model="PushStrLast" style="width: 400px; margin-right: 5px" />
        </div>
        <div class="inpulist">
          <el-checkbox v-model="MarkTop" size="large" />
          <div style="margin: 0 5px">上升指标用 ↑ 标识</div>
          <el-checkbox v-model="MarkLow" size="large" />
          <div style="margin: 0 5px">下降指标用 ↓ 标识</div>
        </div>
        <div class="inpulist">
          <el-checkbox v-model="CommandBind" disabled size="large" />
          <div style="margin: 0 5px">开启指令绑定(批量更新不修改各店铺的推送目标绑定)</div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSave">保存</el-button>
    </template>
    <el-dialog v-model="rbwechatVisible" title="经营日报推送数据设置" width="450px" append-to-body>
      <rbwechatdia
        :funcdata="rbwechatFuncdata"
        @setEnableFields="setEnableFields"
        @setrbwechat="rbwechatVisible = false"
      />
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { gp } from '/@vab/plugins/vab'
import rbwechatdia from './rbwechat.vue'

const props = defineProps<{
  modelValue: boolean
  shopList: any[]
  shopType: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [res?: { SuccessCount: number; FailedList?: { ShopId: string; Reason: string }[] }]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const submitLoading = ref(false)
const rbwechatVisible = ref(false)
const checkedtop = ref(true)
const checkedlow = ref(true)
const timetxet = ref('08:00')
const MinAdBalance = ref(10)
const PushStrFirst = ref('新的一天祝您单量节节高！')
const PushStrLast = ref('以上是为您整理的店铺昨日经营数据。')
const MarkTop = ref(true)
const MarkLow = ref(true)
const CommandBind = ref(true)

const tipslist = ref([
  {
    name: '闭店监控',
    text: '监控门店在正常营业时段出现异常时提醒。',
    Enable: true,
    Time: null,
    type: 'PushNormalClose'
  },
  {
    name: '推广异常提醒',
    text: '监控门店推广余额不足及出价冲突时提醒。',
    Enable: true,
    type: 'PushNormalAd',
    Time: null,
    MinAdBalance: 10
  },
  { name: '新增评价提醒', text: '推送昨日门店新增评价数量。', Enable: true, Time: null, type: 'PushBadComment' },
  {
    name: '门店经营日报',
    text: '昨日经营数据，一键推送掌握',
    Enable: true,
    type: 'PushShopReport',
    Time: '08:00',
    EnableFields: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  },
  {
    name: '到期提醒',
    text: '门店功能到期前7天自提醒，避免服务中断。',
    Enable: false,
    type: 'PushShopEndTime',
    Time: null
  },
  { name: '店铺掉线提醒', text: '门店状态实时监控，掉线立即通知。', Enable: true, type: 'PushShopOut', Time: null }
])

const rbwechatFuncdata = computed(() => {
  const report = tipslist.value.find(t => t.type === 'PushShopReport')
  return {
    shop: null,
    code: 'CHATPUSH',
    ConfObj: {
      PushShopReport: report
        ? { EnableFields: report.EnableFields || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] }
        : {}
    },
    LastExceptionStr: null
  }
})

const setEnableFields = (arr: number[]) => {
  const report = tipslist.value.find(t => t.type === 'PushShopReport')
  if (report) report.EnableFields = arr
}

const buildConfObj = () => {
  const obj: any = {
    MarkTop: MarkTop.value,
    MarkLow: MarkLow.value,
    CommandBind: CommandBind.value,
    PushGroupOffIds: null,
    PushFriendOffids: null
  }
  obj.PushStrFirst = checkedtop.value && PushStrFirst.value ? PushStrFirst.value : null
  obj.PushStrLast = checkedlow.value && PushStrLast.value ? PushStrLast.value : null
  tipslist.value.forEach(item => {
    const key = item.type
    obj[key] = { Enable: item.Enable, Time: item.Time }
    if (key === 'PushNormalAd') obj[key].MinAdBalance = MinAdBalance.value
    if (key === 'PushShopReport') {
      obj[key].EnableFields = item.EnableFields
      obj[key].Time = timetxet.value
    }
  })
  return obj
}

const BATCH_MAX_COUNT = 200

const handleSave = async () => {
  if (props.shopList.length === 0) {
    gp.$baseMessage('请先选择店铺', 'warning', 'hey')
    return
  }
  if (props.shopList.length > BATCH_MAX_COUNT) {
    gp.$baseMessage(`单次最多支持${BATCH_MAX_COUNT}家店铺`, 'warning', 'hey')
    return
  }
  submitLoading.value = true
  try {
    const ConfObj = buildConfObj()
    const shopIds = [
      ...new Set(
        props.shopList
          .map(s => (s as { id?: string; shop?: string }).id ?? (s as { id?: string; shop?: string }).shop)
          .filter(Boolean) as string[]
      )
    ]
    const res = await apiManager.functionuserApi.BatchSetConf_func({
      ShopType: props.shopType,
      Code: 'CHATPUSH',
      ShopIds: shopIds,
      ConfObj
    })
    const failedList = res.FailedList ?? []
    if (failedList.length === 0) {
      gp.$baseMessage(`批量配置更新成功 ${res.SuccessCount} 家`, 'success', 'hey')
    } else {
      gp.$baseMessage(
        `批量配置更新成功 ${res.SuccessCount} 家，失败 ${failedList.length} 家（详见弹窗）`,
        'success',
        'hey'
      )
    }
    emit('success', res)
    handleClose()
  } catch {
    gp.$baseMessage('批量配置更新失败', 'error', 'hey')
  } finally {
    submitLoading.value = false
  }
}

const handleClose = () => {
  visible.value = false
}

watch(
  () => props.modelValue,
  val => {
    if (val) {
      checkedtop.value = true
      checkedlow.value = true
      timetxet.value = '08:00'
      MinAdBalance.value = 10
      PushStrFirst.value = '新的一天祝您单量节节高！'
      PushStrLast.value = '以上是为您整理的店铺昨日经营数据。'
      MarkTop.value = true
      MarkLow.value = true
      CommandBind.value = true
      tipslist.value.forEach(item => {
        item.Enable = ['PushNormalClose', 'PushNormalAd', 'PushBadComment', 'PushShopReport', 'PushShopOut'].includes(
          item.type
        )
        if (item.type === 'PushShopEndTime') item.Enable = false
        if (item.type === 'PushShopReport') item.EnableFields = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      })
    }
  }
)
</script>

<style scoped lang="scss">
.batch-config-content {
  .shop-count {
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
  }

  .config-form {
    max-height: 60vh;
    overflow-y: auto;
  }

  .tscont {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;

    .caritem {
      font-size: 12px;
      width: 48%;
      min-height: 100px;
      background: #fafafa;
      padding: 10px;
      border-radius: 6px;

      .carttop {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .carttips {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
      }

      .tstime {
        display: flex;
        align-items: center;
        margin-top: 5px;
      }
    }
  }

  .inpulist {
    display: flex;
    align-items: center;
    margin-top: 12px;

    .el-checkbox {
      margin-right: 0;
    }
  }
}
</style>
