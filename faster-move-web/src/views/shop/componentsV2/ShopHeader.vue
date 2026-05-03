<template>
  <div class="header-container">
    <div class="header-left">
      <vab-icon class="logo" :icon="icon" is-custom-svg />
      <div class="header-title">{{ basicInfo?.name || '' }}</div>
      <div class="header-tips">{{ formatDescription(basicInfo?.description || '') }}</div>
      <div class="header-center">
        <vab-icon class="notification-2-fill" color="#fff" icon="notification-2-fill" />
        <div class="fun-sta">
          <div class="sta-item" @click="openDrawer('expire')">
            {{ roleIncludeKA ? 'api授权失效' : '即将到期' }}<span :class="{ 'blur-text': demoMode }">{{ currentFunc ?
              currentFunc.almost_end : '0' }}</span>家
          </div>
          <div class="sta-item" @click="openDrawer('lose')">
            {{ roleIncludeKA ? '插件授权失效' : '店铺授权失效'
            }}<span :class="{ 'blur-text': demoMode }">{{ currentFunc ? currentFunc.has_end : '0' }}</span>家
          </div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <img alt="" src="/@/assets/home_images/icon_008.png" />
      使用教程
    </div>
    <el-drawer v-model="drawerState" :direction="'rtl'" size="850" @close="closeTable">
      <template #header>
        <div class="title-box">
          <div style="display: flex; align-items: center">
            <div style="font-weight: 500; font-size: 18px">门店管理</div>
            <div v-if="props.shopType === 1" style="font-size: 12px; margin-left: 10px">
              用于管理已绑定平台账号(美团外卖)下的所有门店的到期时间
            </div>
            <div v-if="props.shopType === 2" style="font-size: 12px; margin-left: 10px">
              用于管理已绑定平台账号(饿了么)下的所有门店授权失效状态,
            </div>
          </div>
        </div>
      </template>
      <div class="recycle-drawer" style="height: 100%">
        <div class="recycle-container" style="border-top: 1px solid #eaeefb; height: 100%; padding: 20px 10px">
          <div class="main">
            <div v-if="drawerType === 'expire'"
              style="display: flex; align-items: center; justify-content: space-between">
              <vab-card class="title-box-item" :class="{ 'title-is-active': queryParams.filter.func_state === 1 }"
                @click="changeTimeState(1)">
                <h3>订购未到期门店</h3>
                <p>{{ currentFunc.not_out }}<span class="unit">家</span></p>
              </vab-card>
              <vab-card class="title-box-item" :class="{ 'title-is-active': queryParams.filter.func_state === 2 }"
                @click="changeTimeState(2)">
                <h3>即将到期门店</h3>
                <p>{{ currentFunc.almost_end }}<span class="unit">家</span></p>
              </vab-card>
              <vab-card class="title-box-item" :class="{ 'title-is-active': queryParams.filter.func_state === 5 }"
                @click="changeTimeState(5)">
                <h3>已到期门店</h3>
                <p>{{ currentFunc.has_end }}<span class="unit">家</span></p>
              </vab-card>
            </div>
            <div class="head" style="margin-top: 30px; display: flex; align-items: center; justify-content: flex-end">
              <el-select v-if="drawerType === 'expire'" v-model="queryParams.filter.func_code" placeholder="请选择功能名称"
                style="width: 175px" @change="getShopList">
                <el-option v-for="item in expireOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-model="queryParams.filter.word" placeholder="搜索门店名称或ID或备注" style="width: 175px"
                @change="getShopList" />
            </div>
            <div class="body" style="display: flex; flex-direction: column; flex: 1; overflow: hidden">
              <el-table v-loading="tableLoading" :data="shopList"
                :height="`${drawerType === 'expire' ? 'calc(100vh - 450px)' : 'calc(100vh - 300px)'}`"
                style="width: 100%; margin-top: 15px">
                <el-table-column align="left" label="门店名称" width="300">
                  <template #default="scope">
                    <div class="mendianbox">
                      <div class="mendianbox-name">
                        <div class="pointer" style="
                            display: flex;
                            align-items: flex-start;
                            color: var(--el-color-primary);
                            font-size: 16px;
                          " @click="clicname(scope.row)">
                          <vab-icon class="logo" :icon="icon" is-custom-svg />
                          <span>{{ scope.row.name }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="城市" width="120">
                  <template #default="{ row }">
                    <p><vab-icon v-if="row.city" icon="map-pin-fill" />{{ row.city }}</p>
                  </template>
                </el-table-column>
                <el-table-column label="店铺授权状态" width="120">
                  <template #default="{ row }">
                    <div class="citytext">
                      <span class="suc-dot" :class="{ 'err-dot': row.state == 3 }"></span>{{ row.state === 3 ? '授权异常' :
                        '授权正常' }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column v-if="drawerType === 'expire'" label="功能名称" width="120">
                  <div>{{expireOptions.find(item => item.value === queryParams.filter.func_code)?.label}}</div>
                </el-table-column>
                <el-table-column label="功能到期时间" width="160">
                  <template #default="{ row }">
                    <div>{{ getFuncEndTime(row) }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template #default="{ row }">
                    <div v-if="drawerType === 'expire'"
                      style="font-size: 14px; color: var(--el-color-primary); cursor: pointer" @click="payFunShow(row)">
                      续费
                    </div>
                    <div v-if="row.state === 3" style="font-size: 14px; color: var(--el-color-primary); cursor: pointer"
                      @click="openApp(row.name)">
                      修复
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <vab-pagination :current-page="queryParams.page" :page-size="queryParams.pageSize" :total="total"
                @current-change="handleCurrentChange" @size-change="handleSizeChange" />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
  </div>
</template>
<script setup lang="ts">
import { addShop, getShop } from '/@/api/shop.ts'
import PayDialog from '/@/views/shop/PayDialog.vue'
import { gp } from '/@vab/plugins/vab.ts'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { useAclStore } from '/@/store/modules/acl'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'
import { Key } from '@element-plus/icons-vue'
import { apiManager } from '/@/TsModel/Api/ApiManager'
const { roleIncludeKA } = useAclStore()

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

// 检查是否在Electron环境中
const isElectron = computed(() => !!(globalThis as any).electron)

const props = defineProps({
  shopTypeStr: {
    type: String,
    default: () => ''
  },
  shopType: Number,
  guard: {
    type: Array<string>,
    default: () => []
  }
})
const icon = props.shopTypeStr.replaceAll(/-feature|-operate/g, '')
const basicInfo = ref<any>({})

// 格式化描述文本，超过30字时进行分行
const formatDescription = (text: string | undefined): string => {
  if (!text) return ''
  // 如果文本长度超过30字，每30字插入一个换行符
  if (text.length > 32) {
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += 32) {
      chunks.push(text.slice(i, i + 32))
    }
    return chunks.join('\n')
  }
  return text
}
const basicInfoList = [
  {
    type: 1,
    name: '美团外卖',
    description: '经营：美食小吃、正餐快餐、龙虾烧烤、火锅、奶茶、汉堡披萨、炸鸡'
  },
  {
    type: 2,
    name: '淘宝闪购外卖',
    description: '经营：美食小吃、正餐快餐、龙虾烧烤、火锅、奶茶、汉堡披萨、炸鸡'
  },
  {
    type: 3,
    name: '美团闪购',
    description: '经营：鲜花、水果、超市百货、生鲜、宠物用品、火锅食材、手机数码、美妆个护、母婴服饰'
  },
  {
    type: 4,
    name: '美团医药',
    description: '经营：成人用品、医疗器械、药店'
  },
  {
    type: 5,
    name: '淘宝闪购零售',
    description: '经营：鲜花、水果、超市百货、生鲜、宠物用品、火锅食材、手机数码、美妆个护、母婴服饰、成人用品、医疗器械'
  },
  {
    type: 6,
    name: '京东到家',
    description: '经营：鲜花、水果、超市百货、生鲜、宠物用品、火锅食材、手机数码、美妆个护、母婴服饰、成人用品、医疗器械'
  },
  {
    type: 7,
    name: '抖音即时零售',
    description: '经营：鲜花、水果、超市百货、生鲜、宠物用品、火锅食材、手机数码、美妆个护、母婴服饰、成人用品、医疗器械'
  },
  {
    type: 8,
    name: '淘宝闪购复制版',
    description: '经营：美食小吃、正餐快餐、龙虾烧烤、火锅、奶茶、汉堡披萨、炸鸡'
  }
]
basicInfo.value = basicInfoList.find(item => item.type === props.shopType) || {}
const drawerState = ref(false)
const closeTable = () => {
  drawerState.value = false
}
const drawerType = ref('')
const openDrawer = (type: string) => {
  drawerState.value = true
  drawerType.value = type
  queryParams.filter.word = undefined
  queryParams.page = 1
  queryParams.pageSize = 20
  if (type === 'expire') {
    queryParams.filter.state = undefined
    queryParams.filter.func_code = 'ZDCC'
    queryParams.filter.func_state = 2
    queryParams.filter.shopType = props.shopType
    queryParams.filter.time_state = 2
  } else if (type === 'lose') {
    queryParams.filter.state = 3
    // queryParams.filter.func_state = undefined
    queryParams.filter.func_code = 'ZDCC'
    queryParams.filter.shopType = props.shopType
    queryParams.filter.func_state = 5
    queryParams.filter.time_state = undefined
  }
  getShopList()
}
const handleCurrentChange = (value: number) => {
  queryParams.page = value
  getShopList()
}
const expireOptions = [
  {
    label: '防漏单',
    value: 'ZDCC'
  },
  {
    label: '自动回复',
    value: 'IMZDHF'
  },
  {
    label: '自动回评',
    value: 'ZDHP'
  },
  {
    label: '自动点金',
    value: 'ZDTG'
  },
  {
    label: '菜品动图',
    value: 'CPDT'
  }
]
const handleSizeChange = (value: number) => {
  queryParams.pageSize = value
  queryParams.page = 1
  getShopList()
}
const tableLoading = ref(false)
const currentFunc = ref<any>({
  almost_end: '',
  not_out: ''
})
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  filter: {
    shopType: props.shopType,
    func_code: 'ZDCC',
    state: undefined as number | undefined,
    func_state: undefined as number | undefined,
    word: undefined as string | undefined,
    time_state: undefined as number | undefined
  }
})
const getFuncCountList = async () => {
  try {
    // 🟢 使用专门的统计接口，只返回统计数据，不传输完整店铺列表
    const result = await apiManager.shopmgApi.GetFuncCount(props.shopType)
    if (result && result[queryParams.filter.func_code]) {
      currentFunc.value = result[queryParams.filter.func_code]
    }
  } catch (error) {
    console.error('获取功能统计失败:', error)
  }
}
const shopList = ref([])
const total = ref(0)
const getShopList = () => {
  tableLoading.value = true
  getShop(queryParams)
    .then((res: any) => {
      if (res.code === 200) {
        shopList.value = res.data.rows
        total.value = res.data.total
        // 🟢 移除了通过列表过滤来统计的逻辑，统计数据由 getFuncCountList() 提供
      }
    })
    .finally(() => {
      tableLoading.value = false
    })
}
const getFuncEndTime = (row: any): string => {
  const funcInfo = row.func_info?.length ? row.func_info : []
  const matchedItem = funcInfo.find((item: any) => item.code === queryParams.filter.func_code)
  if (matchedItem && matchedItem.end_time) {
    const isNotExpired =
      !isNaN(new Date(matchedItem.end_time).getTime()) && new Date(matchedItem.end_time) >= new Date()
    return isNotExpired ? matchedItem.end_time : '已到期'
  }
  return '已到期' // 如果没有找到匹配项或没有 end_time 或者已经过期
}
const changeTimeState = (type: any) => {
  if (queryParams.filter.func_state !== type) {
    queryParams.page = 1
    queryParams.filter.func_state = type
    getShopList()
  }
}

const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)
const payFunShow = (row: any) => {
  let str = expireOptions.find(item => item.value === queryParams.filter.func_code)?.label
  if (str === '防漏单') {
    payTypeText.value = '自动出餐'
  } else if (str === '自动回复') {
    payTypeText.value = 'IM自动回复'
  } else {
    payTypeText.value = str as string
  }
  console.log(payTypeText.value, 'payTypeText.value')
  shopData.value = row
  payDialogState.value = true
}
const closePayDialog = () => {
  payDialogState.value = false
}
const paySuccess = () => {
  payDialogState.value = false
  getShopList()
}
const clicname = (row: any) => {
  // 点击店铺名称的处理函数（预留）
  console.log('店铺信息:', row)
}

getFuncCountList()

const showShopMsgState = ref(false)
const isBind = ref(false)
const showShopMsg = ref({})
const openApp = (name: any) => {
  const invokeMap: Record<number, string> = {
    1: 'open-mt-wm',
    2: 'open-elm-wm',
    3: 'open-mt-wm',
    4: 'open-mt-wm',
    5: 'open-elm-retail',
    6: 'open-jd-home',
    7: 'open-dy-retail',
    8: 'open-elm-wm',
    1000: 'open-mt-groupbuy',
    1001: 'open-jd-home',
    1002: 'open-dy-tuangou-capture',
  }
  const params = {
    name: name || '',
    shop_type: queryParams.filter.shopType
  }
    ; (globalThis as any).electron.openBrowser(invokeMap[queryParams.filter.shopType as number], params, async (res: any) => {
      let data = {
        shop_type: params.shop_type,
        // shop_user: res?.info?.u,
        // shop_pwd: res?.info?.p,
        shop_user: '',
        shop_pwd: '',
        cookies: res.cookies
      }
      addShop(data).then((res1: any) => {
        if (res1.code === 200) {
          if (params.name) {
            gp.$baseMessage('店铺修复成功!', 'success', 'hey')
          } else {
            gp.$baseMessage('店铺添加成功!', 'success', 'hey')
            showShopMsg.value = {
              name: res1.data.name,
              office_id: res1.data.office_id,
              shop_type: params.shop_type,
              // shop_user: res?.info?.u,
              // shop_pwd: res?.info?.p,
              shop_user: '',
              shop_pwd: '',
              cookies: res.cookies,
              reset_power: false
            }
            showShopMsgState.value = true
            isBind.value = false
          }
          getShopList()
        }
      })
    })
}
const closeShopAfter = () => {
  showShopMsgState.value = false
}

// 打开手动授权窗口
const openManualAuthWindow = async () => {
  const electron = (globalThis as any).electron
  if (!electron || !electron.openAuthWindow) {
    gp.$baseMessage('当前环境不支持手动授权操作', 'error', 'hey')
    return
  }

  const platformNames: Record<number, string> = {
    1: '美团外卖',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售'
  }

  try {
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
    const userId = userInfo.admin?.id || ''

    const result = await electron.openAuthWindow({
      shopType: props.shopType,
      name: platformNames[props.shopType as number] || '店铺',
      userId
    })

    if (result.success) {
      if (props.shopType === 1001) {
        gp.$baseMessage('授权窗口已打开，请登录京东店铺后点击"确认授权"，系统将自动完成添加', 'success', 'hey')
      } else {
        gp.$baseMessage('授权窗口已打开，请登录后点击"授权店铺"按钮', 'success', 'hey')
      }
    } else {
      gp.$baseMessage(result.message || '打开授权窗口失败', 'error', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage('打开授权窗口异常: ' + error.message, 'error', 'hey')
  }
}
</script>
<style scoped lang="scss">
.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: center;

    .header-title {
      font-weight: 500;
      font-size: 18px;
      color: rgb(51, 51, 51);
      margin-right: 10px;
    }

    .header-tips {
      white-space: pre-line;
      word-break: break-all;
      line-height: 1.5;
      max-width: 636px;
    }

    .logo {
      width: 30px;
      height: 30px;
      margin-right: 10px;
    }

    .header-center {
      display: flex;
      align-items: center;
      margin-left: 43px;
      height: 36px;
      line-height: 36px;
      border-radius: 18px;
      padding: 0 17px;
      border: 1px solid rgba(51, 51, 51, 0.6);

      .notification-2-fill {
        font-size: 20px;
        color: rgb(238, 145, 63);
        margin-right: 10px;
      }

      .fun-sta {
        display: flex;
        align-items: center;

        .sta-item {
          cursor: pointer;
          margin-right: 10px;

          span {
            color: #ff3e40;
            margin: 0 6px;
          }
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    cursor: pointer;

    img {
      width: 20px;
      height: 20px;
      margin-right: 2px;
    }
  }
}

.title-box-item {
  width: 32%;
  cursor: pointer;
  position: relative;
  overflow: inherit;

  h3 {
    margin-bottom: 20px;
  }
}

.title-is-active {
  border: 1px solid #fea06b;
}

.title-is-active::before {
  height: 0;
  width: 0;
  border: 7px solid;
  border-bottom-width: 0;
  border-color: #fea06b transparent transparent;
  bottom: -7px;
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  content: '';
}

:deep() {
  .pointer {
    .vab-icon {
      margin: 0 6px 0 0;
      width: 24px;
      height: 24px;
    }
  }
}

.suc-dot {
  position: relative;
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 3px;
  vertical-align: middle;
  border-radius: 50%;
  background: var(--el-color-success);
}

.suc-dot:after {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;
  content: '';
  border-radius: 50%;
  animation: vabDot 1.2s ease-in-out infinite;
  background: var(--el-color-success);
}

.err-dot {
  background: var(--el-color-danger);
}

.err-dot:after {
  background: var(--el-color-danger);
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
</style>