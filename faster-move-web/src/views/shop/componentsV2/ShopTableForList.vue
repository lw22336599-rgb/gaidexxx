<template>
  <div class="shop-table">
    <el-tabs v-model="activetab_func" @tab-remove="removetab_func">
      <el-tab-pane v-for="(item, k) in listtabs_func" :key="item.name" :closable="item.name != 1" :label="item.label"
        :name="item.name">
        <template #label>
          <span>
            <span>{{ item.label }}</span>
            <vab-icon v-show="item.label != '首页'"
              :icon="item.muted == 1 ? 'notification-off-fill' : 'notification-4-fill'"
              @click.stop="setMute(k, item)" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 这是多开店铺的店铺后台显示区域 -->
    <div v-show="activetab_func != 1 && activwebv.length > 0">
      <div v-for="item in activwebv" v-show="activetab_func === item.id" :key="item.id"
        style="width: 100%; height: calc(100vh - 360px)">
        <webview :id="'webview' + item.id" allowpopups="true" allowtransparency="true" nodeintegration="true"
          :partition="'persist:webview_' + item.id" plugins="true" :src="item.shop_type === 1
            ? 'https://e.waimai.meituan.com'
            : item.shop_type == 3
              ? 'https://shangoue.meituan.com'
              : item.shop_type == 4
                ? 'https://yiyao.meituan.com/main/frame'
                : item.shop_type === 2
                  ? 'https://melody.shop.ele.me/app/shop/' + item.office_id + '/dashboard#app.shop.dashboard'
                  : item.shop_type == 6
                    ? 'https://store.jddj.com'
                    : item.shop_type == 5
                      ? 'https://nr.ele.me'
                      : item.shop_type == 7
                        ? 'https://jsls.jinritemai.com'
                        : ''
            " style="height: 100%; width: 100%"
          useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
          webpreferences="nativeWindowOpen=yes, spellcheck=no, contextIsolation=no" />
      </div>
    </div>
    <el-table v-if="activetab_func == 1" ref="tableRef" v-loading="listLoading" :border="border" :data="props.shopList"
      height="calc(100vh - 360px)" :size="lineHeight" :stripe="stripe" @selection-change="setSelectRows">
      <el-table-column v-for="(item, index) in finallyColumns" :key="index" :align="item.align" :fixed="item.fixed"
        :label="item.label" :min-width="item.minWidth || 100" show-overflow-tooltip :sortable="item.sortable">
        <template #header>
          <div v-if="item.label === '操作'">
            <span style="margin-right: 10px">操作</span><el-popover popper-class="custom-table-checkbox">
              <template #reference>
                <el-button>
                  <vab-icon icon="settings-line" />
                </el-button>
              </template>
              <el-checkbox-group v-model="checkList">
                <el-checkbox v-for="item in columns" :key="item.label" :disabled="item.disableCheck" :label="item.label"
                  :value="item.label">
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-popover>
          </div>
        </template>
        <template #default="{ row }">
          <div style="position: relative" v-if="item.label === '账号'">
            <div class="item-shop">
              <div class="item-right">
                <div class="item-name">
                  <div class="name-text">{{ row.shop_user }}</div>
                </div>
                <div class="item-remark">负责人：{{ '暂无' }}</div>
                <div class="item-remark">
                  门店备注：{{ row.notes || '暂无' }} <span @click="updateNotes(row)">修改</span>
                </div>
              </div>
            </div>
            <img v-if="row ? row.is_top : false" class="top-up-img" src="/@/assets/shop_images/icon_001.png" />
          </div>
          <div style="position: relative" v-if="item.label === '门店信息'">
            <div class="item-shop">
              <div class="item-right">
                <div class="item-name">
                  <vab-icon class="logo" :icon="icon" is-custom-svg />
                  <div class="name-text">{{ row.name }}</div>
                </div>
                <div style="display: flex; align-items: center">
                  <div class="item-office-id" style="margin-right: 5px; display: flex; align-items: center; gap: 4px;">
                    <span>门店ID：{{ row.office_id }}</span>
                    <el-icon style="cursor: pointer; color: #909399; font-size: 14px;"
                      @click.stop="copyOfficeId(row.office_id)" title="复制门店ID">
                      <DocumentCopy />
                    </el-icon>
                  </div>
                  <img v-if="row.is_top" class="pinned-img" src="/@/assets/shop_images/icon_003a.png"
                    @click="setShopTop(row, false)" />
                  <img v-else class="pinned-img" src="/@/assets/shop_images/icon_002a.png"
                    @click="setShopTop(row, true)" />
                </div>
              </div>
            </div>
            <img v-if="row ? row.is_top : false" class="top-up-img" src="/@/assets/shop_images/icon_001.png" />
          </div>
          <div v-if="item.label === '门店ID'">
            <div class="pointer" @click="loginApp(row)"><vab-icon icon="telegram-2-fill" />打开店铺</div>
            <div class="bind-code">
              绑定码：{{ row.codeStr }}<span v-if="!row.codeStr" class="pointer" @click="viewBindCode(row)">查看</span>
            </div>
            <el-button class="pointer" type="text" style="margin-left: 10px"
              @click.stop="copyshop(row)">复制信息</el-button>
          </div>
          <div v-if="item.label === '门店头像'">
            <div class="item-left">
              <el-popover placement="top-start">
                <el-image :src="row.img" />
                <template #reference>
                  <div style="position: relative">
                    <el-image :src="row.img" style="width: 70px; height: 70px" />
                  </div>
                </template>
              </el-popover>
              <div class="bind-code">
                绑定码: {{ row.codeStr }}
                <span v-if="!row.codeStr" class="pointer" @click="viewBindCode(row)">查看</span>
              </div>
              <!-- <div class="fun-renew" @click="payFunShow(row, '全功能')">全功能续费</div> -->
            </div>
          </div>
          <div v-if="item.label === '门店分组'">
            <div class="item-remark">{{ row.group_name || '暂无' }}</div>
          </div>
          <div v-if="item.label === '门店城市'">
            <div v-if="row.city" class="item-office-id">
              <vab-icon icon="map-pin-fill" /><span class="city-name">{{ row.city }}</span>
            </div>
          </div>
          <div v-if="item.label === '营业状态'">
            <div v-if="row.state !== 3">
              <vab-icon icon="award-fill" :style="`color: ${row.state === 4 ? 'rgb(238, 145, 63)' : '#909399'}`" />
              <span v-if="row.state === 4" class="shop-state">营业中</span>
              <span v-if="row.state === 5" class="shop-state round-icon">暂停营业</span>
              <span v-if="row.state === 6" class="shop-state round-icon">店铺上线中</span>
              <span v-if="row.state === 7" class="shop-state round-icon">店铺已下线</span>
            </div>
            <!-- <div style="font-size: 12px">营业时间↓</div> -->
            <div style="font-size: 12px">{{ row.work_time?.uptime }}</div>
          </div>
          <div v-if="item.label === '授权状态'">
            <div style="display: flex; align-items: center; justify-content: center; margin: 6px 0">
              <div class="state-text">
                <span class="suc-dot" :class="{ 'err-dot': row.state == 3 }"></span>{{ row.state == 3 ? '授权异常' : '授权正常'
                }}
              </div>
            </div>
            <div style="font-size: 12px" v-if="row.state !== 3">上次授权时间↓</div>
            <div style="font-size: 12px" v-if="row.state !== 3">{{ row.ck_uptime }}</div>
            <!-- ck_uptime -->
            <el-button v-if="row.state == 3" size="small" style="margin-left: 10px" type="danger"
              @click="openApp(row.name)">修复</el-button>
            <el-button size="small" style="margin-left: 10px" type="primary" @click="openWindow(row)">一键授权</el-button>
          </div>
          <div v-if="item.label === 'API授权'">
            <div style="display: flex; align-items: center; justify-content: center; margin: 6px 0">
              <div class="state-text"><span class="suc-dot"></span>API已授权</div>
            </div>
          </div>

          <div v-if="item.label === '操作'">
            <div>
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="removeShop(row)">移除</el-button>
            </div>
            <div><el-button link type="primary">分享店铺</el-button></div>
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty class="vab-data-empty" description="暂无数据" />
      </template>
    </el-table>
    <div :class="{ 'blur-pagination': demoMode }" class="pagination-wrapper">
      <vab-pagination :current-page="props.page" :page-size="props.pageSize" :total="props.total"
        :class="{ 'blur-pagination-inner': demoMode }" @current-change="handleCurrentChange"
        @size-change="handleSizeChange" />
    </div>
    <pay-dialog v-if="payDialogState" :pay-dialog-state="payDialogState" :pay-type-text="payTypeText"
      :shop-data="shopData" @close-dialog="closePayDialog" @pay-success="paySuccess" />
    <EditDialog v-if="editDialogState" :edit-dialog-state="editDialogState" :shop-data="shopData"
      @close-dialog="closeEditDialog" @pay-success="paySuccess" />
    <all-func-setting v-if="drawerState" :current-row="currentRow" :drawer-fun="drawerFun" :drawer-state="drawerState"
      @close-drawer="closeDrawer" />
    <!--  添加店铺相关 开始-------------------------------------------------------------->
    <set-only-bind v-if="showShopMsgState" :add-shop-after-obj="showShopMsg" :add-shop-after-state="showShopMsgState"
      :is-bind="isBind" @close-shop-after="closeShopAfter" />
    <!--  添加店铺相关 结束-------------------------------------------------------------->
  </div>
</template>
<script setup lang="ts">
import { addShop, createBindCode, enableFunc, setShopIsTop, unBindShop, updateShopMsg } from '/@/api/shop.ts'
import AllFuncSetting from '/@/views/shop/componentsV2/AllFuncSetting.vue'
import PayDialog from '/@/views/shop/PayDialog.vue'
import EditDialog from '/@/views/shop/componentsV2/EditDialog.vue'
import { gp } from '/@vab/plugins/vab.ts'
import type { TableInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import SetOnlyBind from '/@/views/shop/componentsV2/SetOnlyBind.vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { useSettingsStore } from '/@/store/modules/settings'
import { storeToRefs } from 'pinia'

// 演示模式状态
const settingsStore = useSettingsStore()
const { demoMode } = storeToRefs(settingsStore)

const props = defineProps({
  shopTypeStr: String,
  shopType: Number,
  listLoading: Boolean,
  shopList: Array,
  total: Number,
  page: Number,
  pageSize: Number
})
const icon = props.shopTypeStr.replaceAll(/-feature|-operate/g, '')
const columns = ref<any>([
  {
    label: '账号',
    sortable: false,
    checked: true,
    minWidth: 200,
    align: 'left',
    fixed: 'left',
    disableCheck: true
  },
  {
    label: '门店信息',
    sortable: false,
    checked: true,
    minWidth: 300,
    align: 'left',
    disableCheck: true
  },
  {
    label: '门店头像',
    sortable: false,
    checked: true,
    minWidth: 120,
    align: 'center'
  },
  {
    label: '门店分组',
    sortable: false,
    checked: true,
    minWidth: 80,
    align: 'center'
  },
  {
    label: '门店城市',
    sortable: false,
    checked: true,
    minWidth: 100,
    align: 'center'
  },
  {
    label: '营业状态',
    checked: true,
    minWidth: 160,
    align: 'center'
  },
  {
    label: '授权状态',
    checked: true,
    minWidth: 160,
    align: 'center'
  },
  // {
  //   label: 'API授权',
  //   checked: true,
  //   minWidth: 100,
  //   align: 'center'
  // },
  // {
  //   label: '防漏单',
  //   checked: true,
  //   minWidth: 200,
  //   align: 'center'
  // },
  // {
  //   label: '自动回复',
  //   checked: true,
  //   minWidth: 200,
  //   align: 'center'
  // },
  // {
  //   label: '自动回评',
  //   checked: true,
  //   minWidth: 200,
  //   align: 'center'
  // },
  // {
  //   label: '自动点金',
  //   checked: true,
  //   minWidth: 200,
  //   align: 'center'
  // },
  // {
  //   label: '菜品美化',
  //   checked: true,
  //   minWidth: 200,
  //   align: 'center'
  // },
  {
    label: '操作',
    checked: true,
    minWidth: 100,
    align: 'center',
    disableCheck: true
  }
])
const checkList = ref<any>([])
const finallyColumns = computed(() => columns.value.filter((item: any) => checkList.value.includes(item.label)))
const border = ref<boolean>(false)
const lineHeight = ref<any>('default')
const stripe = ref<boolean>(true)
// 复制门店ID到剪贴板
const copyOfficeId = async (officeId: string) => {
  try {
    await navigator.clipboard.writeText(officeId)
    gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
  } catch (error) {
    // 如果 clipboard API 不可用，使用备用方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = officeId
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      gp.$baseMessage('门店ID已复制到剪贴板', 'success', 'hey')
    } catch (fallbackError) {
      gp.$baseMessage('复制失败，请手动复制', 'error', 'hey')
    }
  }
}
const emit = defineEmits(['updatePage'])
const selectRows = ref<any>([])
const drawerState = ref(false)
const currentRow = ref({})
const drawerFun = ref('')
const copyshop = row => {
  let data =
    '平台：' +
    (row.shop_type == 1
      ? '美团外卖'
      : row.shop_type == 2
        ? '饿了么外卖'
        : row.shop_type == 3
          ? '美团闪购'
          : row.shop_type == 4
            ? '美团医药'
            : row.shop_type == 5
              ? '饿百零售'
              : row.shop_type == 6
                ? '京东到家'
                : row.shop_type == 7
                  ? '抖音即时零售'
                  : '') +
    '\n店铺名称：' +
    row.name +
    '\n门店ID：' +
    row.office_id +
    '\n店铺ID：' +
    row.id +
    '\n防漏单到期时间：' +
    row.ZDCCtime +
    '\n自动回复到期时间：' +
    row.IMZDHFtime +
    '\n自动回评到期时间：' +
    row.ZDHPtime +
    '\n自动点金到期时间：' +
    row.ZDTGtime +
    '\n菜品美化到期时间：' +
    row.CPDTtime
  if (!row.codeStr) {
    createBindCode(row.id).then((res: any) => {
      if (res.code === 200) {
        // row.codeStr = `${res.data}(5分钟内有效)`;
        // row.code = res.data
        data = data + '\n门店绑定码：' + `${res.data}(5分钟内有效)`
        if (copyData(data)) {
          gp.$baseMessage('复制成功', 'success', 'hey')
        } else {
          gp.$baseMessage('复制失败', 'error', 'hey')
        }
      }
    })
  } else {
    data = data + '\n门店绑定码：' + row.codeStr
    if (copyData(data)) {
      gp.$baseMessage('复制成功', 'success', 'hey')
    } else {
      gp.$baseMessage('复制失败', 'error', 'hey')
    }
  }
}
const openDrawer = (row: any, fun_code: string) => {
  if (row.shop_type == 6 && fun_code !== 'ZDCC') {
    return
  }
  if (row[`${fun_code}time`] === '已到期') {
    return gp.$baseMessage('请先续费再使用设置功能', 'error', 'hey')
  }
  drawerState.value = true
  currentRow.value = row
  drawerFun.value = fun_code
}
const closeDrawer = () => {
  drawerState.value = false
}
const setSelectRows = (value: any) => {
  selectRows.value = value
}
const queryData = () => {
  emit('updatePage', {})
}
const handleCurrentChange = (value: number) => {
  emit('updatePage', { page: value })
}
const handleSizeChange = (value: number) => {
  emit('updatePage', { page: 1, pageSize: value })
}
const tableRef = ref<TableInstance>()
const updateNotes = (row: any) => {
  ElMessageBox.prompt('请输入备注', 'Tip', {
    confirmButtonText: '确 认',
    cancelButtonText: '取 消',
    inputPattern: /\S+/,
    inputValue: row.notes,
    inputErrorMessage: '请输入绑定码'
  })
    .then(({ value }) => {
      if (value) {
        updateShopMsg({
          id: row.id,
          UpdateVal: { notes: value }
        }).then((res: any) => {
          if (res.code === 200) {
            gp.$baseMessage('修改成功!', 'success', 'hey')
            queryData()
          }
        })
      }
    })
    .catch(() => { })
}
const viewBindCode = (row: any) => {
  createBindCode(row.id).then((res: any) => {
    if (res.code === 200) {
      row.codeStr = `${res.data}(5分钟内有效)`
      row.code = res.data
      if (copyData(row.code)) {
        gp.$baseMessage('复制成功(绑定码5分钟有效)', 'success', 'hey')
      } else {
        gp.$baseMessage('复制失败', 'error', 'hey')
      }
    }
  })
}
const copyData = async (content: any) => {
  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch {
    if (!navigator.clipboard) {
      try {
        const input = document.createElement('textarea')
        input.value = content
        input.style.position = 'absolute' // 隐藏元素
        input.style.left = '-9999px'
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        return true
      } catch (fallbackError) {
        return false
      }
    }
    return false
  }
}
const setShopTop = (row: any, state: boolean) => {
  let str = state ? '确认置顶此店铺吗？' : '确认取消置顶吗？'
  ElMessageBox.confirm(str, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    draggable: true
  })
    .then(() => {
      setShopIsTop({ shop: row.id, top: state }).then((res: any) => {
        if (res.code === 200) {
          let str2 = state ? '置顶成功！' : '取消置顶成功'
          gp.$baseMessage(str2, 'success', 'hey')
          queryData()
        }
      })
    })
    .catch(() => { })
}

const shopData = ref({})
const payTypeText = ref('')
const payDialogState = ref(false)
const payFunShow = (row: any, typeText: string) => {
  if (row.shop_type == 2) {
    if (['自动回评'].includes(typeText)) {
      return
    }
  }

  if (row.shop_type == 6) {
    if (['全功能', 'IM自动回复', '自动回评', '智能推广', '菜品动图'].includes(typeText)) {
      return
    }
  }
  shopData.value = row
  payTypeText.value = typeText
  payDialogState.value = true
}
const closePayDialog = () => {
  payDialogState.value = false
}
const paySuccess = () => {
  payDialogState.value = false
  emit('updatePage', {})
}

// 编辑店铺
const editDialogState = ref(false)
const openEditDialog = (row: any) => {
  shopData.value = row
  editDialogState.value = true
}

const closeEditDialog = () => {
  editDialogState.value = false
}

const removeShop = (row: any) => {
  unBindShop({
    recycle_bin: true,
    shopIds: [row.id]
  }).then((res: any) => {
    if (res.code === 200) {
      gp.$baseMessage('已移除，可在回收站查看!', 'success', 'hey')
    }
  })
}
// 添加店铺相关 开始------------------------------------------------------------
const showShopMsg = ref({})
const showShopMsgState = ref(false)
const isBind = ref(false)
const closeShopAfter = () => {
  showShopMsgState.value = false
}
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
    shop_type: props.shopType
  }
  globalThis.electron.openBrowser(invokeMap[props.shopType as number], params, async (res: any) => {
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
        emit('updatePage', {})
      }
    })
  })
}
// 添加店铺相关 结束------------------------------------------------------------
// 打开店铺 开始 --------------------------------------------------------------
const openWindow = (row: any) => {
  if (row.state && row.state === 3) {
    gp.$baseMessage('店铺授权失效请修复!', 'error', 'hey')
  } else {
    openWindowShop(row)
  }
}
const openWindowShop = (row: any) => {
  row.cookies = removeStartEnd(row.cookies)
  if (row.shop_type === 1 || row.shop_type === 3 || row.shop_type === 4) {
    globalThis.electron.openWin('https://e.waimai.meituan.com', row.office_id, row.cookies, row.name)
  } else if (row.shop_type == 2) {
    globalThis.electron.openWin(
      `https://melody.shop.ele.me/app/shop/${row.office_id}/dashboard#app.shop.dashboard`,
      row.office_id,
      row.cookies,
      row.name
    )
  } else if (row.shop_type === 5) {
    // globalThis.electron.openWin('https://nr.ele.me', row.office_id, row.cookies, row.name)
    const out: {
      url: string
      name: string
      value: string
      domain: string
    }[] = []
    const jar = parseCookie(row.cookies)
    for (const [key, value] of jar) {
      if (key === `cna`) {
        continue
      }
      out.push({
        url: 'https://nr.ele.me',
        name: encodeURIComponent(key),
        value: encodeURIComponent(value),
        domain: '.ele.me'
      })
    }
    globalThis.electron.openWin('https://nr.ele.me', row.office_id, row.cookies, row.name, JSON.stringify(out))
  } else if (row.shop_type == 6) {
    globalThis.electron.openWin(`https://store.jddj.com`, row.office_id, row.cookies, row.name)
  } else if (row.shop_type == 7) {
    globalThis.electron.openWin(`https://jsls.jinritemai.com`, row.office_id, row.cookies, row.name)
  } else if (row.shop_type == 1000) {
    // 美团团购
    globalThis.electron.openWin(`https://ecom.meituan.com/meishi/`, row.office_id, row.cookies, row.name)
  } else if (row.shop_type == 1001) {
    // 京东团购（暂用京东到家域名）
    globalThis.electron.openWin(`https://store.jddj.com`, row.office_id, row.cookies, row.name)
  }
}
const removeStartEnd = str => {
  if (str && str.length > 0) {
    if (str.charAt(0) == '"') {
      str = str.substring(1)
    }
    if (str.at(-1) == '"') {
      str = str.substring(0, str.length - 1)
    }
  }
  return str
}
// 打开店铺 结束 --------------------------------------------------------------
// 后台打开 开始 --------------------------------------------------------------
const activetab_func = ref('1')
const listtabs_func = ref([{ label: '首页', name: '1' }])
const activwebv = ref<Array<any>>([])
const activeName = ref('')
const loginApp = async (row: any) => {
  let arr = activwebv.value.filter(item => item.id == row.id)
  let arr1 = listtabs_func.value.filter(item => item.name == row.id)
  if (arr.length === 0) {
    activwebv.value.push({ ...row, muted: 0 })
  }
  if (arr1.length === 0) {
    listtabs_func.value.push({ label: row.name, name: row.id, muted: 0 })
  }
  activeName.value = row.id
  activetab_func.value = row.id
  if (arr.length === 0 && arr1.length === 0) {
    await nextTick(() => {
      const webview = document.querySelector(`#webview${row.id}`)
      webview.addEventListener('dom-ready', async () => {
        // 先清空该 partition 下的所有 cookies（与独立窗口打开保持一致）
        await globalThis.electron.clearCookies(`persist:webview_${row.id}`, '*')

        if (row.shop_type == 1) {
          // 美团外卖
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
        } else if (row.shop_type == 3) {
          // 美团闪购
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://shangoue.meituan.com')
        } else if (row.shop_type == 4) {
          // 美团医药 - 使用美团外卖统一入口设置cookies
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.waimai.meituan.com')
        } else if (row.shop_type == 2) {
          globalThis.electron.setCookies(
            `persist:webview_${row.id}`,
            row.cookies,
            `https://melody.shop.ele.me/app/shop/${row.office_id}/dashboard#app.shop.dashboard`
          )
        } else if (row.shop_type == 5) {
          const out: {
            url: string
            name: string
            value: string
            domain: string
          }[] = []
          const jar = parseCookie(row.cookies)
          for (const [key, value] of jar) {
            if (key === `cna`) {
              continue
            }
            out.push({
              url: 'https://nr.ele.me',
              name: encodeURIComponent(key),
              value: encodeURIComponent(value),
              domain: '.ele.me'
            })
          }
          globalThis.electron.setCookies2(`persist:_${row.id}`, JSON.stringify(out), 'https://nr.ele.me')
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nr.ele.me');
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nrshop.ele.me/h5/mtop.ele.newretail.touch.notice.gettouchdomainlist*');
          // globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://nrshop.ele.me/h5/mtop.ele.newretail.ebai.accountreadmtopservice.getshopuserinfo*');
        } else if (row.shop_type == 6) {
          // 京东店铺设置cookies到所有相关子域名（包括品牌饭卡等活动页面）
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://order.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.m.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://trade.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://api.m.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://log-o2o.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://wl.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://stock-store.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://vender-center.jddj.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://passport.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sso.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://uranus.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sgm-w.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://sff.jd.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://storage.360buyimg.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img30.360buyimg.com`)
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://img.360buyimg.com`)
        } else if (row.shop_type == 7) {
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://jsls.jinritemai.com')
        } else if (row.shop_type == 1000) {
          // 美团团购：需向多个域名设置 Cookie
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://ecom.meituan.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://meituan.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://dianping.com')
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, 'https://e.dianping.com')
        } else if (row.shop_type == 1001) {
          // 京东团购（暂用京东到家域名）
          globalThis.electron.setCookies(`persist:webview_${row.id}`, row.cookies, `https://store.jddj.com`)
        }
      })
    })
  }
}
const parseCookie = (cookie: string) => {
  const map = new Map<string, string>()
  for (const item of cookie.split(/\s*;\s*/)) {
    if (item.length === 0) {
      continue
    }
    const [key, value] = <(string | undefined)[]>item.split(/\s*=\s*/)
    if (key === undefined || value === undefined || key.length === 0) {
      continue
    }
    map.set(decodeURIComponent(key), decodeURIComponent(value))
  }
  return map
}
const removetab_func = (name: any) => {
  listtabs_func.value = listtabs_func.value.filter(item => item.name != name)
  activwebv.value = activwebv.value.filter(item => item.id != name)
  activetab_func.value = '1'
}
const setMute = (key: any, acc: any) => {
  nextTick(() => {
    if (activwebv.value[key - 1]) {
      activwebv.value[key - 1]['muted'] = acc.muted === 1 ? 0 : 1
    }
    if (listtabs_func.value[key]) {
      listtabs_func.value[key]['muted'] = acc.muted === 1 ? 0 : 1
    }
    const webview = document.querySelector(`#webview${acc.name}`)
    webview.setAudioMuted(acc.muted === 1)
  })
}
// 后台打开 结束 --------------------------------------------------------------
onActivated(() => {
  tableRef.value?.doLayout()
})
onBeforeMount(() => {
  columns.value.forEach((item: any) => {
    if (item.checked) checkList.value.push(item.label)
  })
})

</script>
<style scoped lang="scss">
::v-deep.shop-table {
  .el-table .cell {
    overflow: visible;
  }
}

.item-shop {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding-top: 10px;
}

.fun-renew {
  color: var(--el-color-primary);
  font-size: 14px;
  cursor: pointer;
}

.item-right {
  .item-name {
    width: 100%;
    height: 46px;
    white-space: wrap;
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    color: var(--el-color-primary);
  }

  .item-office-id {
    font-size: 12px;

    .city-name {
      margin-left: 8px;
    }
  }
}

.item-remark {
  cursor: pointer;
  font-size: 14px;

  span {
    color: var(--el-color-primary);
  }
}

.bind-code {
  font-size: 14px;

  span {
    color: var(--el-color-primary);
  }
}

.pointer {
  color: var(--el-color-primary);
  cursor: pointer;
}

.top-up-img {
  position: absolute;
  top: -10px;
  left: -12px;
  width: 40px;
  height: 40px;
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

.state-text {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0 6px 0 0;
}

.pinned-img {
  height: 24px;
  width: auto;
  cursor: pointer;
}

@keyframes vabDot {
  0% {
    opacity: 0.6;
    transform: scale(0.8);
  }

  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}

.name-text {
  cursor: pointer;
}

// 模糊分页组件中的总数显示（包括"共X条"文本）
.pagination-wrapper {
  &.blur-pagination {

    // 使用多重深度选择器确保穿透所有组件层级
    :deep(.el-pagination .el-pagination__total),
    :deep(.el-pagination [class*="total"]) {
      filter: blur(4px) !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    // 直接匹配第一个 span（total 通常在第一个位置）
    :deep(.el-pagination > span:first-child) {
      filter: blur(4px) !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
  }
}
</style>