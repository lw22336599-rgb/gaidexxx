<template>
  <el-dialog v-model="payDialogStateCom" :before-close="handleClose" :title="shopData?.name || '续费'" width="850">
    <div class="shop">
      <div class="shoptop">
        <img alt="" src="/@/assets/logo.png" style="width: 140px; height: 140px" />
        <div style="flex: 1; box-sizing: border-box; padding: 15px">
          <!-- 全功能续费时显示单功能/全功能/运营版切换按钮（根据平台支持情况显示） -->
          <div v-if="payTypeText === '全功能' || payTypeText.includes('全功能')" class="function-mode-switch">
            <el-button
              :type="functionMode === 'single' ? 'primary' : ''"
              :plain="functionMode !== 'single'"
              @click="switchFunctionMode('single')"
            >
              单功能续费
            </el-button>
            <el-button
              v-if="isSupportAllFunction"
              :type="functionMode === 'all' ? 'primary' : ''"
              :plain="functionMode !== 'all'"
              @click="switchFunctionMode('all')"
            >
              全功能续费
            </el-button>
            <el-button
              v-if="isSupportOperateVersion"
              :type="functionMode === 'operate' ? 'primary' : ''"
              :plain="functionMode !== 'operate'"
              @click="switchFunctionMode('operate')"
            >
              运营版
            </el-button>
          </div>
          <div v-else class="title">{{ payTypeText || '续费' }}</div>

          <!-- 单功能模式：显示功能选择 -->
          <div
            v-if="(payTypeText === '全功能' || payTypeText.includes('全功能')) && functionMode === 'single'"
            class="single-function-selector"
          >
            <div class="function-title">选择功能：</div>
            <div v-if="singleFunctionList.length > 0" class="function-grid">
              <div
                v-for="func in singleFunctionList"
                :key="func.code"
                class="function-item"
                :class="{ 'is-active': selectedSingleFunction === func.code }"
                @click="selectSingleFunction(func.code)"
              >
                {{ func.name }}
              </div>
            </div>
            <div v-else style="color: #909399; font-size: 12px; padding: 6px 0">当前平台暂无可续费功能</div>
          </div>

          <div class="guigebox">
            <!-- 全功能模式：显示功能包含 -->
            <div
              v-if="(payTypeText === '全功能' || payTypeText.includes('全功能')) && functionMode === 'all'"
              class="function-includes"
            >
              功能包含：自动出餐 + 自动回复 + 自动回评 + 点金推广 + 店铺多开(防清除)
            </div>
            <!-- 运营版模式：显示运营版说明 -->
            <div
              v-if="(payTypeText === '全功能' || payTypeText.includes('全功能')) && functionMode === 'operate'"
              class="function-includes"
            >
              运营版：经营日报推送 + 实时经营数据 + 实时调控点金出价 + 实时复制经营数据
            </div>

            <!-- 功能说明区域（移到规格上面） -->
            <div v-if="displayFunctions.length > 0" class="fuwuconten-inline">
              <div class="title">功能说明</div>
              <div class="cartlist">
                <vab-card v-for="fn in displayFunctions" :key="fn.code" class="cartitem">
                  <div>
                    <p>{{ fn.name }}</p>
                    <p v-if="fn.notes">{{ fn.notes }}</p>
                    <p v-else class="no-notes">暂无说明</p>
                  </div>
                </vab-card>
              </div>
            </div>

            <div class="guigebox-header">
              <div class="guigebox-label">规格：</div>
              <div class="tipsbox">
                <div
                  v-for="item in kmList"
                  :key="item.id"
                  class="meal-item"
                  :class="{ 'is-meal-item': currentId === item.price_id, widtbox: item.func_name === 'APP数据服务_月' }"
                  @click="setActive(item)"
                >
                  <div>{{ item.showStr }}</div>
                  <img
                    v-show="currentId === item.price_id"
                    alt=""
                    class="postion"
                    src="/@/assets/shop_images/icon_004a.png"
                  />
                </div>
              </div>
            </div>
            <el-button style="margin: 4px 0 0 50px" type="primary" @click="payDialogStatus">立即订购</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-if="payShow" v-model="payShow" center style="margin-top: 300px" title="支付确认" width="400px">
    <div class="pay-box">
      <div class="pay-con">
        <div class="pay-tips">订单信息</div>
        <div class="pay-item">
          <div>应用名称</div>
          <div>极狐</div>
        </div>
        <div class="pay-item">
          <div>版本信息</div>
          <div>{{ currentMeal.showStr }}</div>
        </div>
        <div class="pay-item">
          <div>版本时长</div>
          <div>{{ currentMeal.add_time }}天</div>
        </div>
        <div class="pay-item">
          <div>订购店铺</div>
          <div>{{ shopData.name }}</div>
        </div>
      </div>
      <div style="width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 20px">
        <el-button :loading="loading" type="primary" @click="submit">立即订购</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { watch, onMounted, nextTick } from 'vue'
import { getFunctionPriceList, payForShopFunc } from '/@/api/shop.ts'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { BatchPayShopV2_Parm } from '@/TsModel/Alien/Controllers/Function/BatchPayShopV2_Parm'
import { gp } from '/@vab/plugins/vab.ts'
import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
import { getRenewFunctionList, getFunctionList } from '@/utils/functionCache'
import { t_wmt_function } from '@/TsModel/Alien/Entity/Tables/function/t_wmt_function'

const props = defineProps<{
  shopData: any
  payTypeText: string
  payDialogState: boolean
}>()
const payDialogStateCom = computed(() => props.payDialogState)

const emit = defineEmits(['closeDialog', 'paySuccess'])
const payShow = ref(false)
const loading = ref(false)
const kmList = ref<any>([])
const currentId = ref('')
const currentMeal = ref<any>({})

// 完整功能列表（包含 notes）
const fullFuncList = ref<t_wmt_function[]>([])

// 单功能/全功能/运营版模式切换（默认选择单功能续费）
const functionMode = ref<'single' | 'all' | 'operate'>('single')
const selectedSingleFunction = ref<string>('')

// 平台支持的可续费功能列表（由后端 show_renew_btn 控制，名称优先用 renew_name）
const platformRenewFunctions = ref<{ code: string; name: string }[]>([])
const platformFunctionsLoaded = ref(false)
const isSupportOperateVersion = ref(false)

// 根据平台支持的功能过滤单功能列表
const singleFunctionList = computed(() => {
  const shopType = props.shopData?.shop_type as ShopType | undefined

  // 饿了么复制版（shopType=8）不支持激活任何功能：不展示任何可续费功能
  if (shopType === ShopType.饿了么官方) {
    return []
  }

  // 未加载完成时返回空列表（避免显示过时的硬编码列表）
  if (!platformFunctionsLoaded.value) {
    return []
  }

  return platformRenewFunctions.value
})

// 是否支持全功能续费（只有支持多个功能且支持运营版的平台才显示全功能）
const isSupportAllFunction = computed(() => {
  // 美团餐饮、饿了么餐饮、美团闪购、京东到家支持全功能和运营版
  return (
    props.shopData?.shop_type === ShopType.美团 ||
    props.shopData?.shop_type === ShopType.饿了么 ||
    props.shopData?.shop_type === ShopType.美团闪购 ||
    props.shopData?.shop_type === ShopType.京东到家
  )
})

// 获取功能说明
const getFuncNotes = (codeOrName: string): string => {
  // 先按 code 查找
  const byCode = fullFuncList.value.find(f => f.code === codeOrName)
  if (byCode?.notes) return byCode.notes

  // 再按 name 查找（兼容一些传名称的情况）
  const byName = fullFuncList.value.find(f => f.name === codeOrName)
  if (byName?.notes) return byName.notes

  return ''
}

// 显示的功能列表（用于功能说明展示）
const displayFunctions = computed(() => {
  // 单功能模式：显示选中的功能说明
  if (
    (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) &&
    functionMode.value === 'single' &&
    selectedSingleFunction.value
  ) {
    const found = fullFuncList.value.find(f => f.code === selectedSingleFunction.value)
    return found ? [found] : []
  }

  // 运营版模式：显示运营版功能说明（APP数据服务）
  if ((props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) && functionMode.value === 'operate') {
    const found = fullFuncList.value.find(f => f.code === 'YYSJFW' || f.name === 'APP数据服务' || f.name === '运营版')
    return found ? [found] : []
  }

  // 全功能模式：显示所有主要功能
  if ((props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) && functionMode.value === 'all') {
    const funcCodes = ['ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG', 'OPENSHOP']
    return fullFuncList.value.filter(f => funcCodes.includes(f.code))
  }

  // 其他情况：根据 payTypeText 查找对应功能
  if (props.payTypeText === 'APP数据服务') {
    const found = fullFuncList.value.find(f => f.code === 'YYSJFW' || f.name === 'APP数据服务' || f.name === '运营版')
    return found ? [found] : []
  }

  // 根据功能名称查找
  const nameMap: Record<string, string> = {
    店铺多开: 'OPENSHOP',
    自动出餐: 'ZDCC',
    IM自动回复: 'IMZDHF',
    自动回评: 'ZDHP',
    智能推广: 'ZDTG',
    点金推广: 'ZDTG',
    评价申诉: 'PJSS'
  }

  const code = nameMap[props.payTypeText]
  if (code) {
    const found = fullFuncList.value.find(f => f.code === code)
    return found ? [found] : []
  }

  return []
})

// 加载平台支持的功能列表
const loadPlatformFunctions = async () => {
  if (!props.shopData?.shop_type) {
    return
  }

  try {
    const shopType = props.shopData.shop_type as ShopType
    platformRenewFunctions.value = await getRenewFunctionList(shopType)
    platformFunctionsLoaded.value = true

    // 检查是否支持运营版（美团餐饮、美团闪购、京东到家支持，饿了么无运营版）
    isSupportOperateVersion.value =
      shopType === ShopType.美团 || shopType === ShopType.美团闪购 || shopType === ShopType.京东到家

    // 如果当前选中的功能不在支持列表中，或者没有选中功能，重置为第一个支持的功能
    if (functionMode.value === 'single') {
      if (selectedSingleFunction.value) {
        const supportedFunc = singleFunctionList.value.find(f => f.code === selectedSingleFunction.value)
        if (!supportedFunc && singleFunctionList.value.length > 0) {
          selectedSingleFunction.value = singleFunctionList.value[0].code
          getKmListData()
        }
      } else if (singleFunctionList.value.length > 0) {
        // 如果没有选中功能，默认选中第一个
        selectedSingleFunction.value = singleFunctionList.value[0].code
        getKmListData()
      }
    }
  } catch (error) {
    console.error('获取平台功能列表失败:', error)
    platformFunctionsLoaded.value = true
    platformRenewFunctions.value = []
  }
}

// 监听 shopData 变化，重新加载功能列表
watch(
  () => props.shopData?.shop_type,
  () => {
    loadPlatformFunctions()
  },
  { immediate: true }
)

// 组件挂载时加载功能列表
onMounted(() => {
  loadPlatformFunctions()
})

// 切换功能模式
const switchFunctionMode = (mode: 'single' | 'all' | 'operate') => {
  functionMode.value = mode
  selectedSingleFunction.value = ''
  currentId.value = ''
  currentMeal.value = {}
  if (mode === 'single') {
    // 单功能模式：默认选择第一个功能
    if (singleFunctionList.value.length > 0) {
      selectedSingleFunction.value = singleFunctionList.value[0].code
    }
  } else if (mode === 'operate') {
    // 运营版模式：直接加载运营版价格列表
    selectedSingleFunction.value = 'APP数据服务'
  }
  // 重新获取价格列表
  getKmListData()
}

// 选择单功能
const selectSingleFunction = (funcCode: string) => {
  selectedSingleFunction.value = funcCode
  currentId.value = ''
  currentMeal.value = {}
  // 重新获取该功能的价格列表
  getKmListData()
}

const setActive = (item: any) => {
  currentId.value = item.price_id
  currentMeal.value = item
}

const submit = async () => {
  if (!currentId.value) {
    gp.$baseMessage('请先选择规格', 'warning', 'hey')
    return
  }

  loading.value = true
  try {
    // 运营版:使用批量续费接口 BatchPayForShopFunc（单店也走该接口）
    // 包括直接传入的APP数据服务，运营版模式，以及单功能模式中选择的运营版
    if (
      props.payTypeText === 'APP数据服务' ||
      functionMode.value === 'operate' ||
      selectedSingleFunction.value === 'APP数据服务'
    ) {
      const parm: BatchPayShopV2_Parm = {
        shops: [props.shopData.id],
        func_price: currentId.value,
        AutoRunAfterPay: false
      }
      const res = await apiManager.functionpriceApi.BatchPayForShopFunc(parm)
      if (res.SuccessCount > 0) {
        gp.$baseMessage('续费成功！', 'success', 'hey')
        payShow.value = false
        emit('paySuccess')
      } else {
        gp.$baseMessage('续费失败，请稍后重试', 'error', 'hey')
      }
    } else {
      // 其它功能保持原有单店续费接口
      const params = {
        shop: props.shopData.id,
        func_price: currentId.value
      }
      const res: any = await payForShopFunc(params)
      if (res.code === 200) {
        gp.$baseMessage('续费成功！', 'success', 'hey')
        payShow.value = false
        emit('paySuccess')
      }
    }
  } finally {
    loading.value = false
  }
}

// 获取运营版价格列表：后端 title 可能为「运营版」或「APP数据服务_月」等，优先用「运营版」查询，否则用「APP数据服务」
const fetchOperateVersionPrices = async (shopType: number): Promise<any[]> => {
  let result = await apiManager.functionpriceApi.GetFunctionPrices(shopType, '运营版', true)
  if (!result.length) {
    result = await apiManager.functionpriceApi.GetFunctionPrices(shopType, 'APP数据服务', true)
  }
  return result
}

const getKmListData = async () => {
  if (!props.payTypeText || !props.shopData?.shop_type) return

  // 全功能续费 - 运营版模式：直接加载运营版价格列表
  if ((props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) && functionMode.value === 'operate') {
    try {
      const result = await fetchOperateVersionPrices(props.shopData.shop_type)
      kmList.value = result
      kmList.value.forEach((item: any) => {
        const name = item.func_name || '运营版'
        item.showStr = `${name}·${item.add_time}天·${item.cost}积分`
      })
      kmList.value.sort((a: any, b: any) => a.cost - b.cost)
      if (kmList.value.length > 0) {
        setActive(kmList.value[0])
      } else {
        currentId.value = ''
        currentMeal.value = {}
      }
    } catch (error) {
      console.error('获取运营版价格列表失败:', error)
      kmList.value = []
      currentId.value = ''
      currentMeal.value = {}
    }
    return
  }

  // 全功能续费 - 单功能模式：根据选择的功能获取价格
  if (
    (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) &&
    functionMode.value === 'single' &&
    selectedSingleFunction.value
  ) {
    // 确保功能列表已加载
    if (fullFuncList.value.length === 0 && props.shopData?.shop_type) {
      try {
        console.log('单功能模式 - 开始加载功能列表, shopType:', props.shopData.shop_type)
        fullFuncList.value = await getFunctionList(props.shopData.shop_type)
        console.log('单功能模式 - 已加载功能列表:', fullFuncList.value.length, '个功能')
      } catch (error) {
        console.error('获取功能列表失败:', error)
        kmList.value = []
        return
      }
    }

    // 运营版：使用运营版API获取价格
    if (selectedSingleFunction.value === 'APP数据服务') {
      try {
        const result = await fetchOperateVersionPrices(props.shopData.shop_type)
        kmList.value = result
        kmList.value.forEach((item: any) => {
          const name = item.func_name || '运营版'
          item.showStr = `${name}·${item.add_time}天·${item.cost}积分`
        })
        kmList.value.sort((a: any, b: any) => a.cost - b.cost)
        if (kmList.value.length > 0) {
          setActive(kmList.value[0])
        } else {
          currentId.value = ''
          currentMeal.value = {}
        }
      } catch (error) {
        console.error('获取运营版价格列表失败:', error)
        kmList.value = []
        currentId.value = ''
        currentMeal.value = {}
      }
      return
    }

    // 其他功能：使用后端返回的功能名称直接查询价格
    // 从 fullFuncList 中查找对应的功能，使用其 name 作为 priceTitle
    console.log(
      '查找功能 - selectedSingleFunction:',
      selectedSingleFunction.value,
      'fullFuncList长度:',
      fullFuncList.value.length
    )
    const currentFunc = fullFuncList.value.find(f => f.code === selectedSingleFunction.value)
    if (!currentFunc) {
      console.error(
        '未找到功能:',
        selectedSingleFunction.value,
        '可用的功能列表:',
        fullFuncList.value.map(f => ({ code: f.code, name: f.name }))
      )
      kmList.value = []
      currentId.value = ''
      currentMeal.value = {}
      return
    }

    const priceTitle = currentFunc.name
    console.log(
      '单功能模式 - selectedSingleFunction:',
      selectedSingleFunction.value,
      'functionName:',
      currentFunc.name,
      'priceTitle:',
      priceTitle
    )
    try {
      const result = await apiManager.functionpriceApi.GetFunctionPrices(props.shopData.shop_type, priceTitle, true)
      kmList.value = result
      kmList.value.forEach((item: any) => {
        item.showStr = `${item.func_name}·${item.add_time}天·${item.cost}积分`
      })
      kmList.value.sort((a: any, b: any) => a.cost - b.cost)
      if (kmList.value.length > 0) {
        setActive(kmList.value[0])
      }
    } catch (error) {
      console.error('获取功能价格列表失败:', error)
      kmList.value = []
      currentId.value = ''
      currentMeal.value = {}
    }
    return
  }

  // 运营版：使用 FunctionPriceApi.GetFunctionPrices，保持与批量续费一致
  if (props.payTypeText === 'APP数据服务') {
    try {
      const result = await fetchOperateVersionPrices(props.shopData.shop_type)
      kmList.value = result
      kmList.value.forEach((item: any) => {
        const name = item.func_name || '运营版'
        item.showStr = `${name}·${item.add_time}天·${item.cost}积分`
      })
      kmList.value.sort((a: any, b: any) => a.cost - b.cost)
      if (kmList.value.length > 0) {
        setActive(kmList.value[0])
      } else {
        currentId.value = ''
        currentMeal.value = {}
      }
    } catch (error) {
      console.error('获取运营版价格列表失败:', error)
      kmList.value = []
      currentId.value = ''
      currentMeal.value = {}
    }
    return
  }

  // 其它功能：沿用原来的 getFunctionPriceList 逻辑
  // 兼容历史：老入口可能传“全功能|店铺多开”
  let priceTitle = props.payTypeText
  if (priceTitle.includes('全功能|店铺多开')) {
    priceTitle = '店铺多开'
  }
  console.log(
    '其它功能 - payTypeText:',
    props.payTypeText,
    'priceTitle:',
    priceTitle,
    'shopType:',
    props.shopData.shop_type
  )
  try {
    const result = await apiManager.functionpriceApi.GetFunctionPrices(props.shopData.shop_type, priceTitle, true)
    kmList.value = result
    kmList.value.forEach((item: any) => {
      item.showStr = `${item.func_name}·${item.add_time}天·${item.cost}积分`
    })
    kmList.value.sort((a: any, b: any) => a.cost - b.cost)
    if (kmList.value.length > 0) {
      setActive(kmList.value[0])
    }
  } catch (error) {
    console.error('获取功能价格列表失败:', error)
  }
}

const handleClose = () => {
  // 重置状态（下次打开时默认单功能续费）
  functionMode.value = 'single'
  selectedSingleFunction.value = ''
  currentId.value = ''
  currentMeal.value = {}
  if (singleFunctionList.value.length > 0) {
    selectedSingleFunction.value = singleFunctionList.value[0].code
  }
  emit('closeDialog')
}
const payDialogStatus = () => {
  // 单功能模式需要选择功能
  if (
    (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) &&
    functionMode.value === 'single' &&
    !selectedSingleFunction.value
  ) {
    gp.$baseMessage('请先选择功能', 'warning', 'hey')
    return
  }
  // 运营版模式需要选择规格
  if (
    (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) &&
    functionMode.value === 'operate' &&
    !currentId.value
  ) {
    gp.$baseMessage('请先选择规格', 'warning', 'hey')
    return
  }
  payShow.value = true
}

// 监听弹窗打开，默认选中第一个可激活的功能
watch(
  () => props.payDialogState,
  async newVal => {
    if (newVal) {
      // 加载完整功能列表（包含 notes）
      if (props.shopData?.shop_type && fullFuncList.value.length === 0) {
        try {
          fullFuncList.value = await getFunctionList(props.shopData.shop_type)
          console.log('弹窗打开 - 已加载功能列表:', fullFuncList.value.length, '个功能')
        } catch (error) {
          console.error('获取功能列表失败:', error)
        }
      }

      // 弹窗打开时，如果是全功能续费模式，默认选中第一个功能
      if (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) {
        functionMode.value = 'single' // 默认选择单功能模式
        // 等待功能列表加载完成后，选中第一个功能
        nextTick(() => {
          if (singleFunctionList.value.length > 0) {
            selectedSingleFunction.value = singleFunctionList.value[0].code
            getKmListData()
          }
        })
      }
    } else {
      // 关闭时清理功能列表
      fullFuncList.value = []
    }
  }
)

// 监听功能列表变化，如果当前没有选中功能，自动选中第一个
watch(
  singleFunctionList,
  newList => {
    if (props.payDialogState && (props.payTypeText === '全功能' || props.payTypeText.includes('全功能'))) {
      if (functionMode.value === 'single' && !selectedSingleFunction.value && newList.length > 0) {
        selectedSingleFunction.value = newList[0].code
        getKmListData()
      }
    }
  },
  { immediate: true }
)

// 监听payTypeText变化，重置状态（默认选择单功能续费）
watch(
  () => props.payTypeText,
  () => {
    if (props.payTypeText === '全功能' || props.payTypeText.includes('全功能')) {
      // 如果平台不支持全功能和运营版，强制使用单功能模式
      if (!isSupportAllFunction.value) {
        functionMode.value = 'single'
      } else {
        functionMode.value = 'single' // 默认选择单功能模式
      }
      // 默认选择第一个功能
      if (singleFunctionList.value.length > 0) {
        selectedSingleFunction.value = singleFunctionList.value[0].code
      } else {
        selectedSingleFunction.value = ''
      }
    } else {
      functionMode.value = 'all'
      selectedSingleFunction.value = ''
    }
    getKmListData()
  }
)

// 监听平台功能列表变化，如果当前模式不支持，自动切换
watch([platformRenewFunctions, isSupportAllFunction], () => {
  // 如果当前是全功能模式但平台不支持，切换到单功能模式
  if (functionMode.value === 'all' && !isSupportAllFunction.value) {
    functionMode.value = 'single'
    if (singleFunctionList.value.length > 0) {
      selectedSingleFunction.value = singleFunctionList.value[0].code
    }
    getKmListData()
  }
  // 如果当前是运营版模式但平台不支持，切换到单功能模式
  if (functionMode.value === 'operate' && !isSupportOperateVersion.value) {
    functionMode.value = 'single'
    if (singleFunctionList.value.length > 0) {
      selectedSingleFunction.value = singleFunctionList.value[0].code
    }
    getKmListData()
  }
})

// 初始化：在 loadPlatformFunctions 完成后会自动设置默认值
// 如果 payTypeText 是"全功能"，会在 watch 中处理
// 否则直接获取价格列表
if (props.payTypeText && props.payTypeText !== '全功能' && !props.payTypeText.includes('全功能')) {
  getKmListData()
}
</script>
<style scoped lang="scss">
:deep(.el-dialog__body) {
  // 限制弹窗内容高度，避免全功能介绍把整体撑太高
  max-height: 60vh;
  overflow: auto;
  padding: 12px 16px;
}

.shop {
  padding-bottom: 12px;

  .shoptop {
    display: flex;
    font-size: 14px;
    width: 100%;
    gap: 12px;

    > img {
      width: 120px !important;
      height: 120px !important;
      flex: 0 0 auto;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .guigebox {
      border-top: 1px solid #dfdfdf;
      padding-top: 10px;
      margin-top: 10px;

      .function-includes {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
        padding: 10px 12px;
        background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
        border: 1px solid #e8eaed;
        border-radius: 6px;
        line-height: 1.5;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .guigebox-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1px;
        min-height: 36px;

        .guigebox-label {
          white-space: nowrap;
          font-size: 14px;
          line-height: 34px;
          flex-shrink: 0;
        }

        .tipsbox {
          flex: 1;
          margin-left: 8px;
          display: flex;
          flex-direction: column;
        }
      }
    }

    .buton {
      width: 107px;
      height: 32px;
      background: #ff9d0a;
      border-radius: 4px;
      font-size: 16px;
      text-align: center;
      line-height: 32px;
      color: #fff;
      margin-left: 41px;
    }
  }

  .cart {
    border: 1px solid #666;
    width: 48%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-bottom: 20px;
    position: relative;
  }

  .postion {
    position: absolute;
    right: 0;
    bottom: 0;
  }

  .fuwuconten {
    border-top: 1px solid #dfdfdf;
    padding: 10px 0 0;
    margin-top: 10px;

    .title {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .cartlist {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-self: start;
      justify-content: space-between;
      gap: 0px; // 使用 gap 控制卡片间距

      .cartitem {
        :deep() {
          .el-card__body {
            display: flex;
            width: 380px;
            height: 65px; // 进一步调小高度：从 80px 改为 65px
            justify-content: center;
            align-items: center;
            margin-bottom: 0; // 去除 margin-bottom，使用外层 gap
            background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%); // 淡淡的渐变背景
            padding: 6px 10px; // 调小内边距：从 8px 改为 6px
            border-radius: 8px;
            border: 1px solid #e8eaed;
            transition: all 0.3s;

            &:hover {
              background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
              border-color: #c6e2ff;
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
            }

            img {
              width: 50px; // 进一步调小图片尺寸：从 60px 改为 50px
              height: 50px;
              margin-right: 10px;
            }

            > div {
              font-size: 13px;
              flex: 1;

              p:nth-of-type(1) {
                font-size: 14px; // 调小标题字体
                font-weight: 600;
                margin-bottom: 4px; // 进一步调小间距：从 6px 改为 4px
                color: #303133;
              }

              p:nth-of-type(2) {
                color: #606266;
                line-height: 1.4; // 调小行高：从 1.5 改为 1.4
                font-size: 12px; // 调小描述文字字体
              }

              .no-notes {
                color: #909399;
                font-style: italic;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}

.fuwuconten-inline {
  padding: 10px 0;
  margin-bottom: 10px;

  .title {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .cartlist {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    align-items: start;

    .cartitem {
      :deep() {
        .el-card__body {
          display: flex;
          width: 100%;
          min-height: 50px;
          height: auto;
          justify-content: center;
          align-items: center;
          margin-bottom: 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #e8eaed;
          transition: all 0.3s;

          &:hover {
            background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
            border-color: #c6e2ff;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
          }

          img {
            width: 40px;
            height: 40px;
            margin-right: 10px;
          }

          > div {
            font-size: 13px;
            flex: 1;

            p:nth-of-type(1) {
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 4px;
              color: #303133;
            }

            p:nth-of-type(2) {
              color: #606266;
              line-height: 1.3;
              font-size: 12px;
            }

            .no-notes {
              color: #909399;
              font-style: italic;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

.pay-box {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 20px;

  .pay-con {
    .pay-tips {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .pay-item {
      font-size: 14px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
  }
}

.meal-item {
  height: 34px;
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  width: 100%;
  border: 1px solid #333;
  line-height: 34px;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
}

.widtbox {
  width: fit-content;
  padding: 0 15px;
}

.is-meal-item {
  border: 1px solid #e02020;
  position: relative;
}

.function-mode-switch {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .el-button {
    min-width: 100px;
  }
}

.single-function-selector {
  margin-bottom: 16px;

  .function-title {
    font-size: 14px;
    margin-bottom: 12px;
    color: #606266;
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;

    .function-item {
      min-height: 40px;
      height: auto;
      padding: 8px 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      color: #606266;
      font-size: 14px;
      word-break: break-all;
      text-align: center;

      &:hover {
        border-color: #409eff;
        color: #409eff;
      }

      &.is-active {
        border-color: #409eff;
        background: #ecf5ff;
        color: #409eff;
        font-weight: 500;
      }
    }
  }
}

// 单功能和运营版规格选项样式（与全功能续费保持一致）
.single-function-grid {
  .meal-item {
    margin-bottom: 12px; // 与全功能续费保持一致
    width: 100%; // 与全功能续费保持一致，每个选项占满一行
  }
}
</style>
